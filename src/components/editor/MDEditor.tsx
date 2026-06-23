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
	InsertCodeBlock,
	InsertThematicBreak,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	ListsToggle,
	markdownShortcutPlugin,
	MDXEditor,
	MDXEditorMethods,
	quotePlugin,
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

export default function MDEditor() {
	const { nodes, selectedFile, cachedContent } = useEditor();
	const [file, setFile] = useState<Node>();
	const [content, setContent] = useState("");

	const [saved, setSaved] = useState(false);
	const [saveInterval, setSaveInterval] = useState<ReturnType<typeof setInterval>>();

	const [loading, setLoading] = useState(false);

	const dispatch = useEditorDispatch();
	const editorRef = useRef<MDXEditorMethods>(null);

	useEffect(() => {
		setContent("");
		editorRef.current?.setMarkdown("");
		setLoading(true);
		if (!selectedFile) {
			setFile(undefined);
		}

		const newFile = nodes.find(node => node.id === selectedFile);
		if (!newFile)
			return;

		setFile(newFile);

		const newContent = cachedContent[newFile.id];

		if (!newContent) {
			getContent(newFile.id).then(res => {
				if (res.error)
					return;

				setContent(res.data!.content);
				dispatch?.({ type: "cache-content", content: res.data!.content, nodeId: newFile.id });
				editorRef.current?.setMarkdown(res.data!.content);
				setLoading(false);
			});
		} else {
			setContent(newContent);
			editorRef.current?.setMarkdown(newContent);
			setLoading(false);
		}
		editorRef.current?.focus();
	}, [selectedFile]);

	useEffect(() => {
		function checkSaved(e: Event) {
			console.log("saved:", saved);
			if (!saved) {
				e.preventDefault();
				return true;
			}
		}

		window.addEventListener("beforeunload", checkSaved);

		return () => window.removeEventListener("beforeunload", checkSaved);
	}, [saved]);

	useEffect(() => {
		function save() {
			if (!file || !editorRef.current)
				return;

			const newContent = editorRef.current.getMarkdown();

			dispatch?.({ type: "cache-content", content: newContent, nodeId: file.id });
			editContent(file.id, newContent);
			setSaved(true);
		}

		setSaveInterval(setInterval(() => save(), 5000));

		return () => {
			clearInterval(saveInterval);
			setSaveInterval(undefined);
		};
	}, [file, editorRef.current]);

	return (
		<div className={`w-full h-full overflow-hidden ${loading ? "bg-ctp-mantle opacity-50" : ""}`}>
			{!loading && <MDXEditor
				className="dark-theme dark-editor"
				contentEditableClassName="text-ctp-text! pt-0! absolute inset-0 overflow-y-scroll"
				markdown={content ?? ""}
				onChange={() => setSaved(false)}
				autoFocus
				ref={editorRef}
				plugins={[
					headingsPlugin(),
					quotePlugin(),
					listsPlugin(),
					codeBlockPlugin(),
					thematicBreakPlugin(),
					linkPlugin(),
					linkDialogPlugin(),
					codeMirrorPlugin({
						codeBlockLanguages: languages,
						codeMirrorExtensions: [catppuccinMocha],
					}),
					markdownShortcutPlugin(),
					toolbarPlugin({
						toolbarClassName: "mdx-toolbar",
						toolbarContents: () => <>
							<UndoRedo />
							<BoldItalicUnderlineToggles />
							<ListsToggle />
							<CreateLink />
							<InsertThematicBreak />
							<CodeToggle />
							<ConditionalContents
								options={[
									{ when: editor => editor?.editorType === "codeblock", contents: () => <ChangeCodeMirrorLanguage /> },
									{ fallback: () => <InsertCodeBlock /> },
								]}
							/>
						</>,
					}),
				]}
			/>}
		</div>
	);
}
