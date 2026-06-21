"use client";

import {
	BoldItalicUnderlineToggles,
	codeBlockPlugin,
	codeMirrorPlugin,
	CodeToggle,
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

export default function MDEditor() {
	const { nodes, selectedFile, cachedContent } = useEditor();
	const [file, setFile] = useState<Node>();
	const [content, setContent] = useState("");

	const [loading, setLoading] = useState(false);

	const dispatch = useEditorDispatch();
	const editorRef = useRef<MDXEditorMethods>(null);

	useEffect(() => {
		if (!file || !content)
			return;

		editContent(file.id, content);
		dispatch?.({ type: "cache-content", content, nodeId: file.id });
	}, [content]);

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

	return (
		<div className={`w-full h-full ${loading ? "bg-ctp-mantle opacity-50" : ""}`}>
			{!loading && <MDXEditor
				className="dark-theme dark-editor"
				contentEditableClassName="text-ctp-text! h-full pt-0!"
				markdown={content ?? ""}
				onChange={setContent}
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
						codeBlockLanguages: [],
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
							<InsertCodeBlock />
						</>,
					}),
				]}
			/>}
		</div>
	);
}
