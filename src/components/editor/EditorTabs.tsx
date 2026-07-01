import { useEditor, useEditorDispatch } from "./EditorContext";
import { Node } from "@/db/types";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EditorTab({ tab, index }: { tab: Node, index: number }) {
	const { nodes, selectedFile, unsavedFiles } = useEditor();
	const dispatch = useEditorDispatch();

	const { ref } = useSortable({ id: tab.id, index, transition: { duration: 0, idle: false, easing: "linear" } });

	const [hovered, setHovered] = useState(false);

	const router = useRouter();

	return <div
		className={`
			${selectedFile === tab.id ? "bg-ctp-surface0" : ""}
			hover:bg-ctp-surface0 pl-4 pr-1 py-2 cursor-pointer transition-colors flex gap-1 items-center border-r border-ctp-surface0
		`}
		onClick={() => {
			dispatch?.({ type: "open-file", file: tab.id });
			dispatch?.({ type: "select-file", file: tab.id });
		}}
		onMouseOver={() => setHovered(true)}
		onMouseLeave={() => setHovered(false)}
		ref={ref}
		key={tab.id}
	>
		{tab.name}
		{(!hovered && unsavedFiles.includes(tab.id)) && <div className="p-0.5 mx-1 size-2 bg-ctp-text rounded-full" />}
		{((unsavedFiles.includes(tab.id) && hovered) || !unsavedFiles.includes(tab.id)) && <X
			className={`size-4 text-ctp-subtext0 hover:bg-ctp-surface1 p-0.5 transition-all
			${(hovered || selectedFile === tab.id) ? "opacity-100" : "opacity-0"}`}
			onClick={e => {
				e.stopPropagation();
				dispatch?.({ type: "close-file", file: tab.id });
			}}
		/>}
	</div>;
}

export default function EditorTabs() {
	const { nodes, openFiles } = useEditor();
	const dispatch = useEditorDispatch();

	return !!openFiles.length ? <DragDropProvider onDragEnd={event => {
		if (event.canceled)
			return;

		const { source } = event.operation;

		if (isSortable(source)) {
			const { initialIndex, index } = source;

			if (initialIndex !== index) {
				const newOpenFiles = [...openFiles];
				const [removed] = newOpenFiles.splice(initialIndex, 1);
				newOpenFiles.splice(index, 0, removed);
				dispatch?.({ type: "set-open-files", openFiles: newOpenFiles });
			}
		}
	}}>
		<div className="w-full border-b border-ctp-surface0 flex">
			{openFiles.map(id => nodes.find(f => f.id === id)!).map((tab, index) => <EditorTab tab={tab} index={index} key={tab.id} />)}
		</div>
	</DragDropProvider> : null;
}
