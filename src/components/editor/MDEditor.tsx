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

export default function MDEditor() {
	const { nodes, selectedFile, cachedContent } = useEditor();
	const [file, setFile] = useState<Node>();
	const [content, setContent] = useState("");
	const oldContent = useRef("");

	const [saved, setSaved] = useState(true);
	const [saveInterval, setSaveInterval] = useState<ReturnType<typeof setInterval>>();

	const [loading, setLoading] = useState(false);

	const dispatch = useEditorDispatch();
	const editorRef = useRef<MDXEditorMethods>(null);

	useEffect(() => {
		MathfieldElement.soundsDirectory = null;
		MathfieldElement.fontsDirectory = null;
	}, []);

	useEffect(() => {
		if (file && editorRef.current) {
			const newContent = editorRef.current.getMarkdown();
			dispatch?.({ type: "cache-content", content: newContent, nodeId: file.id });
			editContent(file.id, newContent);
			setSaved(true);
		}

		setContent("");
		editorRef.current?.setMarkdown("");
		setLoading(true);
		if (!selectedFile)
			setFile(undefined);

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
			if (!file || !editorRef.current || file.id !== selectedFile)
				return;

			const newContent = editorRef.current.getMarkdown();

			if (newContent === oldContent.current)
				return void setSaved(true);

			oldContent.current = newContent;

			dispatch?.({ type: "cache-content", content: newContent, nodeId: file.id });
			editContent(file.id, newContent);
			setSaved(true);
		}

		if (!saveInterval)
			setSaveInterval(setInterval(save, 5000));

		return () => {
			clearInterval(saveInterval);
			setSaveInterval(undefined);
		};
	}, [file, selectedFile, oldContent.current, editorRef.current]);

	return (
		<div className={`w-full h-full overflow-hidden ${loading ? "bg-ctp-mantle opacity-50" : ""}`}>
			{!loading && <MDXEditor
				className="dark-theme dark-editor"
				contentEditableClassName="text-ctp-text! pt-0! absolute inset-0 overflow-y-scroll"
				markdown={content ?? ""}
				onChange={v => setSaved(false)}
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
					imagePlugin({
						imageUploadHandler: async file => (await uploadImage(file)).data!,
						disableImageSettingsButton: true,
						imagePlaceholder: () => <Spinner className="size-30 p-10 bg-ctp-surface0" />,
					}),
					codeMirrorPlugin({
						codeBlockLanguages: languages,
						codeMirrorExtensions: [catppuccinMocha],
					}),
					jsxPlugin({ jsxComponentDescriptors: [mathEditorDescriptor] }),
					markdownShortcutPlugin(),
					toolbarPlugin({
						toolbarClassName: "mdx-toolbar",
						toolbarContents: () => <div className="flex w-full justify-between items-center">
							<div className="flex">
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
