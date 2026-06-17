"use client";

import { File } from "@/db/types";
import { ChevronRight, EllipsisVertical, FileIcon } from "lucide-react";
import { useState } from "react";
import { useEditor, useEditorDispatch } from "./EditorContext";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "../primitives/Dropdown";

export function SidebarFile({
	children,
	folder,
	selected,
	...props
}: { selected?: boolean; folder?: boolean } & React.PropsWithChildren &
	React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={`${selected ? "bg-ctp-surface0" : "hover:bg-ctp-surface0"}
				w-full text-left px-2 py-1 cursor-pointer transition-colors flex justify-between items-center`}
			{...props}
		>
			<div className="flex gap-1 items-center">
				{folder ? (
					<ChevronRight
						size={18}
						className={`${selected ? "rotate-90" : ""} transition-transform`}
					/>
				) : (
					<FileIcon size={18} />
				)}{" "}
				{children}
			</div>
			<Dropdown>
				<DropdownTrigger asChild>
					<div className="hover:bg-ctp-surface1 py-1 transition-colors text-ctp-subtext0"><EllipsisVertical size={16} /></div>
				</DropdownTrigger>
				<DropdownContent>
					<DropdownItem>Edit</DropdownItem>
					<DropdownItem>Delete</DropdownItem>
				</DropdownContent>
			</Dropdown>
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
			<SidebarFile folder selected={open} onClick={() => setOpen(!open)}>
				{name}
			</SidebarFile>
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
			{files.filter(file => !file.folderId).map(file => <SidebarFile
				key={file.id}
				selected={selectedFile === file.id}
				onClick={() => onFileClick(file)}
			>
				{file.name}
			</SidebarFile>)}
			{folders.map(folder => <SidebarFolder name={folder.name}>
				{files.filter(file => file.folderId === folder.id)
					.map(file => <SidebarFile
						key={file.id}
						selected={selectedFile === file.id}
						onClick={() => onFileClick(file)}
					>
						{file.name}
					</SidebarFile>)}
			</SidebarFolder>)}
		</div>
	);
}
