"use client";

import { File } from "@/db/types";
import { ChevronRight, FileIcon } from "lucide-react";
import { useState } from "react";
import { useEditor, useEditorDispatch } from "./EditorContext";

export function SidebarButton({
	children,
	folder,
	selected,
	...props
}: { selected?: boolean; folder?: boolean } & React.PropsWithChildren &
	React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={`${selected ? "bg-ctp-surface0" : "hover:bg-ctp-surface0"}
				w-full text-left px-2 py-1 cursor-pointer transition-colors flex gap-1 items-center`}
			{...props}
		>
			{folder ? (
				<ChevronRight
					size={18}
					className={`${selected ? "rotate-90" : ""} transition-transform`}
				/>
			) : (
				<FileIcon size={18} />
			)}{" "}
			{children}
		</button>
	);
}

export function SidebarFolder({
	name,
	children,
}: { name: string } & React.PropsWithChildren) {
	const [open, setOpen] = useState(false);

	return (
		<div>
			<SidebarButton folder selected={open} onClick={() => setOpen(!open)}>
				{name}
			</SidebarButton>
			{open && (
				<div className="pl-1 ml-3 flex flex-col gap-1 mt-1 border-l border-ctp-surface0">
					{children}
				</div>
			)}
		</div>
	);
}

export default function Sidebar() {
	const { files, folders, openFiles, selectedFile } = useEditor();
	const dispatch = useEditorDispatch();

	function onFileClick(file: File) {
		if (!openFiles.includes(file.id))
			dispatch?.({ type: "open-file", file: file.id });

		dispatch?.({ type: "select-file", file: file.id });
	}

	return (
		<div className="w-fit min-w-60 h-full p-2 border-r border-ctp-surface0 flex flex-col gap-1">
			{files.filter(file => !file.folderId).map(file => <SidebarButton
				key={file.id}
				selected={selectedFile === file.id}
				onClick={() => onFileClick(file)}
			>
				{file.name}
			</SidebarButton>)}
			{folders.map(folder => <SidebarFolder name={folder.name}>
				{files.filter(file => file.folderId === folder.id)
					.map(file => <SidebarButton
						key={file.id}
						selected={selectedFile === file.id}
						onClick={() => onFileClick(file)}
					>
						{file.name}
					</SidebarButton>)}
			</SidebarFolder>)}
		</div>
	);
}
