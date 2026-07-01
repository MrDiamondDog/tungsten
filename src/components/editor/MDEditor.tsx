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
import { catppuccinMocha } from "@fsegurai/codemirror-theme-bundle";
import { languages } from "@codemirror/language-data";
import { InsertMathButton, mathEditorDescriptor } from "./MathEditor";
import { MathfieldElement } from "mathlive";
import uploadImage from "@/actions/images";
import Spinner from "../primitives/Spinner";
import { getAllFilePaths } from "@/lib/utils/navigation";
import { getTree } from "@/lib/utils/data";

export default function MDEditor() {
	const { nodes, selectedFile, cachedContent, viewMode } = useEditor();

	const [loading, setLoading] = useState(false);
	const [file, setFile] = useState<Node>();
	const [initialContent, setInitialContent] = useState("");
	const content = useRef("");

	const [saved, setSaved] = useState(true);

	const dispatch = useEditorDispatch();
	const editorRef = useRef<MDXEditorMethods>(null);

	function save() {
		if (!file)
			return;

		// console.log("saving file", file.name, "-----------------");
		// console.log("ref?", !!editorRef.current);

		// console.log("content to save", content.current);

		console.log(file.name, content.current);

		editContent(file.id, content.current);
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
				getContent(selectedFile).then(res => {
					if (res.error)
						return "";
					return res.data!.content;
				})
					.then(resolve);
			} else
				resolve(cachedContent[selectedFile]);
		}).then(newContent => {
			dispatch?.({ type: "cache-content", content: newContent, nodeId: selectedFile });
			setInitialContent(newContent);
			content.current = newContent;
			editorRef.current?.setMarkdown(newContent);
			setLoading(false);
			setFile(newFile);
		});
	}, [selectedFile]);

	useEffect(() => {
		function checkSaved(e: Event) {
			if (!saved) {
				e.preventDefault();
				return true;
			}
		}
		window.addEventListener("beforeunload", checkSaved);

		return () => window.removeEventListener("beforeunload", checkSaved);
	}, [saved]);

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

	return (
		<div className={`w-full h-full overflow-hidden ${(!file || loading) ? "bg-ctp-mantle opacity-50" : ""}`}>
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
					className="dark-theme dark-editor"
					contentEditableClassName={`text-ctp-text! overflow-y-scroll ${viewMode !== "readonly" && "absolute inset-0 pt-0!"}`}
					markdown={initialContent}
					onChange={v => {
						setSaved(false);
						content.current = v;
					}}
					autoFocus
					readOnly={viewMode === "readonly"}
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
								if (link.startsWith("/"))
									// TODO: handle this
									return;
							},
						}),
						imagePlugin({
							imageUploadHandler: async file => (await uploadImage(file)).data!,
							disableImageSettingsButton: true,
							imagePlaceholder: () => <Spinner className="size-30 p-10 bg-ctp-surface0" />,
						}),
						codeMirrorPlugin({
							codeBlockLanguages: languages,
							codeMirrorExtensions: [catppuccinMocha],
						}),
						tablePlugin(),
						jsxPlugin({ jsxComponentDescriptors: [mathEditorDescriptor] }),
						markdownShortcutPlugin(),
						toolbarPlugin({
							toolbarClassName: "mdx-toolbar",
							toolbarContents: () => <div className="flex w-full justify-between items-center" data-hidden={viewMode === "readonly"}>
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
