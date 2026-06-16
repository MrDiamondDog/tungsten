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

export default function MDEditor() {
	const { files, selectedFile } = useEditor();
	const [file, setFile] = useState<File>();

	const dispatch = useEditorDispatch();
	const editorRef = useRef<MDXEditorMethods>(null);

	function onChange(content: string) {
		if (!file)
			return;

		setFile({ ...file, content });
		dispatch?.({ type: "edit-file", file: { ...file, content } });
	}

	useEffect(() => {
		if (!selectedFile)
			return void setFile(undefined);

		const newFile = files.find(f => f.id === selectedFile);
		if (!newFile)
			return;

		setFile(newFile);
		editorRef.current?.setMarkdown(newFile.content);
		editorRef.current?.focus();
	}, [selectedFile]);

	return (
		<div className="w-full h-full">
			<MDXEditor
				contentEditableClassName="text-ctp-text! h-full"
				markdown={file?.content ?? ""}
				onChange={onChange}
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
