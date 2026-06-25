"use client";

import { useState } from "react";
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "../primitives/Dropdown";
import NewFileModal from "../modals/NewFileModal";
import NewFolderModal from "../modals/NewFolderModal";

export function MenuBarItem({ name, ...props }: { name: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return <Dropdown>
		<DropdownTrigger asChild>
			<button {...props}
				className={`${props.className ?? ""} outline-none px-2 py-1 hover:bg-ctp-surface0
					transition-colors cursor-pointer`}>
				{name}
			</button>
		</DropdownTrigger>
		<DropdownContent>
			{props.children}
		</DropdownContent>
	</Dropdown>;
}

export default function MenuBar() {
	const [openModal, setOpenModal] = useState("");

	return (<>
		<div className="w-full p-1 border-b border-ctp-surface0 flex gap-1 items-center">
			<MenuBarItem name="File">
				<DropdownItem onClick={() => setOpenModal("new-file")}>New File</DropdownItem>
				<DropdownItem onClick={() => setOpenModal("new-folder")}>New Folder</DropdownItem>
				<DropdownSeparator />
				<DropdownItem>Import</DropdownItem>
				<DropdownItem>Export</DropdownItem>
			</MenuBarItem>
			<MenuBarItem name="Edit">
				<DropdownItem>Preferences</DropdownItem>
			</MenuBarItem>
		</div>
		<NewFileModal open={openModal === "new-file"} onClose={() => setOpenModal("")} />
		<NewFolderModal open={openModal === "new-folder"} onClose={() => setOpenModal("")} />
	</>);
}
