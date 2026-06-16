"use client";

import EditorTabs from "./EditorTabs";
import Sidebar from "./Sidebar";
import dynamic from "next/dynamic";
import { useEditor } from "./EditorContext";

const MDEditor = dynamic(() => import("@/components/editor/MDEditor"), {
	ssr: false,
});

export default function TabbedEditor() {
	const { selectedFile } = useEditor();

	return (<>
		<Sidebar />
		<div className="w-full">
			<EditorTabs />
			{selectedFile && <MDEditor />}
		</div>
	</>);
}
