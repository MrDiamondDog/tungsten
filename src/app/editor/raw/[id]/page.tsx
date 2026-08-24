"use client";

import { useEditor, useEditorDispatch } from "@/components/editor/EditorContext";
import { RealmProvider } from "@mdxeditor/editor";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { use, useEffect } from "react";

const MDEditor = dynamic(() => import("@/components/editor/MDEditor"), { ssr: false })

export default function RawPage({ params }: { params: Promise<{ id: string }> }) {
	const session = useSession();

	const { id } = use(params);
	const { nodes } = useEditor();
	const dispatch = useEditorDispatch();

	const node = nodes.find(n => n.id === id && n.nodeType === "file" && n.userId === session.data?.user?.id);

	console.log(id, node);

	useEffect(() => {
		dispatch?.({ type: "open-file", file: id });
		dispatch?.({ type: "select-file", file: id });
		dispatch?.({ type: "update-view-mode", viewMode: "pdf" });
	}, [])

	if (!node)
		return null;

	return <RealmProvider>
		<div className="w-screen bg-white latte overflow-scroll">
			<MDEditor />
		</div>
	</RealmProvider>
}
