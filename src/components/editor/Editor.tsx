"use client";

import { RealmProvider } from "@mdxeditor/editor";
import EditorTabs from "./EditorTabs";
import Sidebar from "./Sidebar";
import dynamic from "next/dynamic";
import EditorTitle from "./EditorTitle";

const MDEditor = dynamic(() => import("@/components/editor/MDEditor"), {
	ssr: false,
});

export default function TabbedEditor() {
	return (<div className="w-full h-full flex">
		<EditorTitle />
		<Sidebar />
		<div className="w-full h-full flex flex-col">
			<EditorTabs />
			<RealmProvider>
				<MDEditor />
			</RealmProvider>
		</div>
	</div>);
}
