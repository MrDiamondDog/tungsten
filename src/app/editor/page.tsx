"use client";

import EditorTabs from "@/components/editor/EditorTabs";
import MenuBar from "@/components/editor/MenuBar";
import Sidebar from "@/components/editor/Sidebar";
import dynamic from "next/dynamic";
import { useState } from "react";

const MDEditor = dynamic(() => import("@/components/editor/MDEditor"), {
	ssr: false,
});

export default function EditorPage() {
	const [markdown, setMarkdown] = useState(
		"# Hi\n## hi 2\n### hi 3\n#### hi 4\n- unordered list\n1. ordered list",
	);

	const [pages, setPages] = useState(["file 1", "file 2", "file 3"]);
	const [selectedPage, setSelectedPage] = useState(pages[0]);

	return (
		<main className="w-full h-full">
			<MenuBar />
			<div className="h-full flex">
				<Sidebar />
				<div className="w-full">
					<EditorTabs
						tabs={pages}
						selected={selectedPage}
						onListChange={setPages}
						onSelectedChange={setSelectedPage}
					/>
					{selectedPage && <MDEditor markdown={markdown} />}
				</div>
			</div>
		</main>
	);
}
