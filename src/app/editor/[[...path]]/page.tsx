"use client";

import Editor from "@/components/editor/Editor";
import { useEditor, useEditorDispatch } from "@/components/editor/EditorContext";
import MenuBar from "@/components/editor/MenuBar";
import { FileTree, getTree, TreeItem } from "@/lib/utils/data";
import { use, useEffect } from "react";

export default function EditorPage({ params }: PageProps<"/editor/[[...path]]">) {
	const { path } = use(params);

	const { nodes, selectedFile, openFiles } = useEditor();
	const dispatch = useEditorDispatch();

	useEffect(() => {
		if (!path || !nodes.length)
			return;

		const tree = getTree(nodes, null);

		let currentNode: TreeItem | undefined = undefined;
		for (const node of path) {
			const folderTree: FileTree = currentNode ? currentNode.children! : tree;

			currentNode = folderTree.find(n => n.name === decodeURIComponent(node));

			if (currentNode?.nodeType === "file")
				break;
		}
		if (!currentNode || currentNode.id === selectedFile)
			return;

		console.log(openFiles);
		if (openFiles.includes(currentNode.id))
			dispatch?.({ type: "select-file", file: currentNode.id });
		else {
			dispatch?.({ type: "open-file", file: currentNode.id });
			dispatch?.({ type: "select-file", file: currentNode.id });
		}
	}, [nodes, path]);

	return (
		<main className="w-full h-full flex flex-col">
			<MenuBar />
			<Editor />
		</main>
	);
}
