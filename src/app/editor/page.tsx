"use client";

import Editor from "@/components/editor/Editor";
import MenuBar from "@/components/editor/MenuBar";

export default function EditorPage() {
	return (
		<main className="w-full h-full flex flex-col">
			<MenuBar />
			<Editor />
		</main>
	);
}
