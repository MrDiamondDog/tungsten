"use client";

import {
	BoldItalicUnderlineToggles,
	Button,
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
import { useRouter } from "next/navigation";
import { getAllFilePaths } from "@/lib/utils/navigation";
import { getTree } from "@/lib/utils/data";

export default function MDEditor() {
	const { nodes, selectedFile, cachedContent, viewMode } = useEditor();

	const [loading, setLoading] = useState(false);
	const [file, setFile] = useState<Node>();
	const [initialContent, setInitialContent] = useState("");

	const [saved, setSaved] = useState(true);
	const [saveInterval, setSaveInterval] = useState<ReturnType<typeof setInterval>>();

	const [lastViewMode, setLastViewMode] = useState("");

	const dispatch = useEditorDispatch();
	const editorRef = useRef<MDXEditorMethods>(null);

	const router = useRouter();

	useEffect(() => {
		MathfieldElement.soundsDirectory = null;
		MathfieldElement.fontsDirectory = null;
	}, []);

	useEffect(() => {
		setLoading(true);

		if (file && editorRef.current) {
			const newContent = editorRef.current.getMarkdown();
			dispatch?.({ type: "cache-content", content: newContent, nodeId: file.id });
			editContent(file.id, newContent);
			setSaved(true);
		}

		setFile(undefined);
		setInitialContent("");
		editorRef.current?.setMarkdown("");

		if (!selectedFile)
			return;

		const newFile = nodes.find(n => n.id === selectedFile);

		if (!newFile || newFile.nodeType !== "file")
			return;

		if (cachedContent[selectedFile] === null || cachedContent[selectedFile] === undefined) {
			getContent(selectedFile).then(res => {
				if (res.error)
					return "";
				return res.data!.content;
			})
				.then(newContent => {
					dispatch?.({ type: "cache-content", content: newContent, nodeId: selectedFile });
					setInitialContent(newContent);
					editorRef.current?.setMarkdown(newContent);
					setLoading(false);
				});
		} else {
			const newContent = cachedContent[selectedFile];
			setInitialContent(newContent);
			editorRef.current?.setMarkdown(newContent);
			setLoading(false);
		}

		setFile(newFile);
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
		let lastSavedContent: string | null = null;

		function save() {
			if (!file || !selectedFile || !editorRef.current || !cachedContent[file.id])
				return;

			const currentContent = cachedContent[file.id];

			if (lastSavedContent === currentContent)
				return;

			lastSavedContent = currentContent;

			editContent(file.id, currentContent);

			setSaved(true);
		}

		if (!saveInterval)
			setSaveInterval(setInterval(save, 5000));

		return () => {
			clearInterval(saveInterval);
			setSaveInterval(undefined);
		};
	}, [file, editorRef.current, viewMode]);

	useEffect(() => {
		if (!file || !selectedFile || !editorRef.current) {
			setLastViewMode(viewMode);
			return;
		}

		if (lastViewMode === "raw" && viewMode === "normal") {
			setInitialContent(cachedContent[file.id]);
			editorRef.current.setMarkdown(cachedContent[file.id]);
		}

		setLastViewMode(viewMode);
	}, [viewMode]);

	return (
		<div className={`w-full h-full overflow-hidden ${(!file || loading) ? "bg-ctp-mantle opacity-50" : ""}`}>
			{(file && !loading && viewMode === "raw") && <textarea
				className="w-full h-full overflow-y-scroll resize-none p-2 font-mono"
				value={cachedContent[file.id]}
				onChange={e => {
					setSaved(false);
					dispatch?.({ type: "cache-content", content: e.target.value, nodeId: file.id });
				}}
			/>}
			{(file && !loading && viewMode !== "raw") && <MDXEditor
				className="dark-theme dark-editor"
				contentEditableClassName={`text-ctp-text! overflow-y-scroll ${viewMode !== "readonly" && "absolute inset-0 pt-0!"}`}
				markdown={initialContent}
				onChange={v => {
					setSaved(false);
					dispatch?.({ type: "cache-content", content: v, nodeId: file.id });
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
								link = `/editor${link}`;
							router.push(link);
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
							<div>
								<Button>Raw</Button>
							</div>
						</div>,
					}),
				]}
			/>}
		</div>
	);
}
