"use client";

import {
	BoldItalicUnderlineToggles,
	ChangeCodeMirrorLanguage,
	codeBlockPlugin,
	codeMirrorPlugin,
	CodeToggle,
	ConditionalContents,
	CreateLink,
	headingsPlugin,
	imagePlugin,
	InsertCodeBlock,
	InsertTable,
	InsertThematicBreak,
	jsxPlugin,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	ListsToggle,
	markdownShortcutPlugin,
	MDXEditor,
	MDXEditorMethods,
	quotePlugin,
	tablePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
	UndoRedo,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useEffect, useRef, useState } from "react";
import { useEditor, useEditorDispatch } from "./EditorContext";
import { Node } from "@/db/types";
import { editContent, getContent } from "@/actions/content";
import { catppuccinMocha, githubLight } from "@fsegurai/codemirror-theme-bundle";
import { languages } from "@codemirror/language-data";
import { InsertMathButton, mathEditorDescriptor } from "./MathEditor";
import { MathfieldElement } from "mathlive";
import uploadImage from "@/actions/images";
import Spinner from "../primitives/Spinner";
import { getAllFilePaths, nodeFromPath } from "@/lib/utils/navigation";
import { getTree } from "@/lib/utils/data";
import { useTheme } from "../theme/ThemeContext";
import { getPublicEnv } from "@/public-env";
import { error, throwToast } from "@/lib/utils/errors";

export default function MDEditor() {
	const { nodes, selectedFile, cachedContent, unsavedFiles, viewMode } = useEditor();

	const [loading, setLoading] = useState(false);
	const [file, setFile] = useState<Node>();
	const [initialContent, setInitialContent] = useState("");
	const content = useRef("");

	const [saved, setSaved] = useState(true);

	const { theme } = useTheme();

	const dispatch = useEditorDispatch();
	const editorRef = useRef<MDXEditorMethods>(null);

	const nodeListRef = useRef(nodes);

	useEffect(() => {
		nodeListRef.current = nodes;
	}, [nodes]);

	function save() {
		if (!file)
			return;

		// console.log("saving file", file.name, "-----------------");
		// console.log("ref?", !!editorRef.current);

		// console.log("content to save", content.current);

		editContent(file.id, content.current).catch(e => {
			setSaved(false);
			throwToast("Could not save file", e);
		});
		dispatch?.({ type: "cache-content", content: content.current, nodeId: file.id });
		setSaved(true);

		// console.log("finished saving ----------------");
	}

	useEffect(() => {
		MathfieldElement.soundsDirectory = null;
		MathfieldElement.fontsDirectory = null;
	}, []);

	useEffect(() => {
		setLoading(true);

		// console.log("LOADING NEW FILE -----------------------------------------------------");

		// console.log("pathname", pathname);
		// console.log("current content", content.current);

		// console.log("prev. file:", file?.name);
		if (file && editorRef.current)
			dispatch?.({ type: "cache-content", content: content.current, nodeId: file.id });

		setFile(undefined);
		setInitialContent("");
		content.current = "";
		editorRef.current?.setMarkdown("");

		if (!selectedFile)
			return;

		const newFile = nodes.find(n => n.id === selectedFile);

		if (!newFile || newFile.nodeType !== "file")
			return;

		// console.log("new file", newFile.name);
		// console.log("cache?", !(cachedContent[selectedFile] === null || cachedContent[selectedFile] === undefined));

		new Promise<string>(resolve => {
			if (cachedContent[selectedFile] === null || cachedContent[selectedFile] === undefined) {
				getContent(selectedFile)
					.then(res => resolve(res.content))
					.catch(e => throwToast("Could not fetch content", e));
			} else
				resolve(cachedContent[selectedFile]);
		}).then(newContent => {
			dispatch?.({ type: "cache-content", content: newContent, nodeId: selectedFile });
			setInitialContent(newContent);
			content.current = newContent;
			editorRef.current?.setMarkdown(newContent);
			setLoading(false);
			setFile(newFile);
			setSaved(!unsavedFiles.includes(newFile.id));
		});
	}, [selectedFile]);

	useEffect(() => {
		if (!saved && file && !unsavedFiles.includes(file.id))
			dispatch?.({ type: "add-unsaved-file", file: file.id });
		else if (saved && file && unsavedFiles.includes(file.id))
			dispatch?.({ type: "remove-unsaved-file", file: file.id });

		function checkSaved(e: Event) {
			if (unsavedFiles.length) {
				e.preventDefault();
				return true;
			}
		}
		window.addEventListener("beforeunload", checkSaved);

		return () => window.removeEventListener("beforeunload", checkSaved);
	}, [saved, unsavedFiles, file]);

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "s" && e.ctrlKey) {
				e.preventDefault();
				save();
			}
		}

		window.addEventListener("keydown", onKeyDown);

		return () => window.removeEventListener("keydown", onKeyDown);
	}, [file]);

	useEffect(() => {
		if (viewMode === "pdf" && file) {
			document.title = file?.name ?? "Tungsten";
			setTimeout(print, 3000);
		}
	}, [file, viewMode]);

	return (
		<div className={`w-full h-full ${viewMode !== "pdf" && "overflow-hidden"} ${(!file || loading) ? "bg-ctp-mantle opacity-50" : ""}`}>
			{(file && !loading && viewMode === "raw") && <textarea
				className="w-full h-full overflow-y-scroll resize-none p-2 font-mono"
				defaultValue={content.current}
				onChange={e => {
					setSaved(false);
					content.current = e.target.value;
					editorRef.current?.setMarkdown(e.target.value);
				}}
			/>}
			<div className={`${file && !loading && viewMode !== "raw" ? "" : "hidden"} h-full`}>
				<MDXEditor
					className={viewMode !== "pdf" ? "dark-theme dark-editor" : "light-theme light-editor"}
					contentEditableClassName={`overflow-y-scroll ${viewMode === "pdf" ? "text-black" : "text-ctp-text!"} ${viewMode !== "readonly" && viewMode !== "pdf" && "absolute inset-0 pt-0!"}`}
					markdown={initialContent}
					onChange={v => {
						setSaved(false);
						content.current = v;
					}}
					autoFocus
					readOnly={viewMode === "readonly" || viewMode === "pdf"}
					ref={editorRef}
					plugins={[
						headingsPlugin(),
						quotePlugin(),
						listsPlugin(),
						codeBlockPlugin(),
						thematicBreakPlugin(),
						linkPlugin(),
						linkDialogPlugin({
							linkAutocompleteSuggestions: getAllFilePaths(getTree(nodes)),
							onClickLinkCallback: (link: string) => {
								if (link.startsWith("http"))
									return void window.open(link);
								if (link.startsWith("/")) {
									const path = link.slice(1).split("/");
									const node = nodeFromPath(getTree(nodeListRef.current), path);
									console.log(node);
									if (node && node.nodeType === "file") {
										dispatch?.({ type: "open-file", file: node.id });
										dispatch?.({ type: "select-file", file: node.id });
									}
									return;
								}
							},
						}),
						imagePlugin({
							imageUploadHandler: async file => {
								if ((file.size / 1024 / 1024) > parseInt(getPublicEnv().IMAGE_MAX_SIZE))
									throw error(`Image too large. Must be <${getPublicEnv().IMAGE_MAX_SIZE}mb.`);
								return await uploadImage(file).catch(e => throwToast("Could not upload image", e));
							},
							disableImageSettingsButton: true,
							imagePlaceholder: () => <Spinner className="size-30 p-10 bg-ctp-surface0" />,
						}),
						codeMirrorPlugin({
							codeBlockLanguages: languages,
							codeMirrorExtensions: [theme !== "latte" && viewMode !== "pdf" ? catppuccinMocha : githubLight],
						}),
						tablePlugin(),
						jsxPlugin({ jsxComponentDescriptors: [mathEditorDescriptor] }),
						markdownShortcutPlugin(),
						toolbarPlugin({
							toolbarClassName: "mdx-toolbar",
							toolbarContents: () => <div className="flex w-full justify-between items-center" data-hidden={viewMode === "readonly" || viewMode === "pdf"}>
								<div className="flex">
									<UndoRedo />
									<BoldItalicUnderlineToggles />
									<ListsToggle />
									<CreateLink />
									<InsertThematicBreak />
									<InsertTable />
									<CodeToggle />
									<ConditionalContents
										options={[
											{ when: editor => editor?.editorType === "codeblock", contents: () => <ChangeCodeMirrorLanguage /> },
											{ fallback: () => <InsertCodeBlock /> },
										]}
									/>
									<InsertMathButton />
								</div>
							</div>,
						}),
					]}
				/>
			</div>
		</div>
	);
}
