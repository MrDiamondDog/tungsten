"use client";

import { useEditor } from "./EditorContext";
import { useEffect } from "react";

export default function EditorTitle() {
	const { nodes, selectedFile } = useEditor();

	useEffect(() => {
		const node = nodes.find(n => n.id === selectedFile);
		document.title = node ? `Tungsten - ${node.name}` : "Tungsten";
	}, [selectedFile]);

	return <></>;
}
