import { X } from "lucide-react";
import { useState } from "react";
import { useEditor, useEditorDispatch } from "./EditorContext";
import { Node } from "@/db/types";

export default function EditorTabs() {
	const { nodes, openFiles, selectedFile, unsavedFiles } = useEditor();
	const dispatch = useEditorDispatch();

	const [hovered, setHovered] = useState<Node>();

	return !!openFiles.length ? (
		<div className="w-full border-b border-ctp-surface0 flex">
			{openFiles.map(id => nodes.find(f => f.id === id)!).map(tab => (
				<div
					className={`
						${selectedFile === tab.id ? "bg-ctp-surface0" : ""}
						hover:bg-ctp-surface0 pl-4 pr-1 py-2 cursor-pointer transition-colors flex gap-1 items-center border-r border-ctp-surface0
					`}
					onClick={() => dispatch?.({ type: "select-file", file: tab.id })}
					onMouseOver={() => setHovered(tab)}
					onMouseLeave={() => setHovered(undefined)}
					key={tab.id}
				>
					{tab.name}
					{(!unsavedFiles.includes(tab.id) || hovered?.id === tab.id) && <X
						className={`size-4 text-ctp-subtext0 hover:bg-ctp-surface1 p-0.5 transition-all
						${(hovered?.id === tab.id || selectedFile === tab.id) ? "opacity-100" : "opacity-0"}`}
						onClick={e => {
							e.stopPropagation();
							dispatch?.({ type: "close-file", file: tab.id });
						}} />}
					{(hovered?.id !== tab.id && unsavedFiles.includes(tab.id)) && <div className="rounded-full bg-ctp-text size-1.5 p-0.5 mx-1" />}
				</div>
			))}
		</div>
	) : null;
}
