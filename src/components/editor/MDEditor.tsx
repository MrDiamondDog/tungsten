"use client";

import {
	codeBlockPlugin,
	headingsPlugin,
	listsPlugin,
	markdownShortcutPlugin,
	MDXEditor,
	MDXEditorMethods,
	quotePlugin,
	thematicBreakPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useEffect, useRef, useState } from "react";
import { useEditor, useEditorDispatch } from "./EditorContext";
import { File } from "@/db/types";
import { editFile } from "@/actions/files";

export default function MDEditor() {
	const { files, selectedFile } = useEditor();
	const [file, setFile] = useState<File>();
	const [content, setContent] = useState("");

	const dispatch = useEditorDispatch();
	const editorRef = useRef<MDXEditorMethods>(null);

	async function onSave() {
		if (!file)
			return;

		setFile({ ...file, content });
		dispatch?.({ type: "edit-file", file: { ...file, content } });
		dispatch?.({ type: "saved-file", file: file.id });

		await editFile(file.id, { ...file, content });
	}

	useEffect(() => {
		if (!file)
			return;

		if (file.content !== content)
			dispatch?.({ type: "unsaved-file", file: file.id });

		dispatch?.({ type: "edit-file", file: { ...file, content } });
	}, [content]);

	useEffect(() => {
		if (!selectedFile) {
			setFile(undefined);
			setContent("");
		}

		const newFile = files.find(f => f.id === selectedFile);
		if (!newFile)
			return;

		setFile(newFile);
		setContent(newFile.content);
		editorRef.current?.setMarkdown(newFile.content);
		editorRef.current?.focus();
	}, [selectedFile]);

	function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
		if (!file)
			return;

		if (e.key === "s" && e.ctrlKey) {
			e.preventDefault();
			e.stopPropagation();
			onSave();
		}
	}

	return (
		<div className="w-full h-full" onKeyDown={onKeyDown}>
			<MDXEditor
				contentEditableClassName="text-ctp-text! h-full"
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
					markdownShortcutPlugin(),
				]}
			/>
		</div>
	);
}
