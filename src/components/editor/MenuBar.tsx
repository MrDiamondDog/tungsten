"use client";

import { createNode } from "@/actions/nodes";
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "../primitives/Dropdown";
import { signOut } from "next-auth/react";
import { useEditorDispatch } from "./EditorContext";

export function MenuBarItem({ trigger, ...props }: { trigger: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return <Dropdown>
		<DropdownTrigger asChild>
			<button {...props}
				className={`outline-none px-2 py-1 hover:bg-ctp-surface0
					transition-colors cursor-pointer ${props.className ?? ""}`}>
				{trigger}
			</button>
		</DropdownTrigger>
		<DropdownContent>
			{props.children}
		</DropdownContent>
	</Dropdown>;
}

export default function MenuBar() {
	const dispatch = useEditorDispatch();

	async function onCreate(type: "folder" | "file") {
		const nodeData = {
			parentNode: null,
			nodeType: type,
			name: `New ${type === "file" ? "File" : "Folder"}`,
		};

		const newNode = await createNode(nodeData).then(res => {
			if (res.error)
				throw res.error;

			return res.data!;
		});

		dispatch?.({ type: "create-node", node: newNode });
	}

	return (<>
		<div className="w-full p-1 border-b border-ctp-surface0 flex gap-1 items-center">
			<MenuBarItem trigger={<img src="/tungsten.svg" width={32} height={32} />} className="px-1! py-0!">
				<DropdownItem onClick={() => signOut({ redirectTo: "/" })}>Log Out</DropdownItem>
			</MenuBarItem>
			<MenuBarItem trigger="File">
				<DropdownItem onClick={() => onCreate("file")}>New File</DropdownItem>
				<DropdownItem onClick={() => onCreate("folder")}>New Folder</DropdownItem>
				<DropdownSeparator />
				<DropdownItem>Import</DropdownItem>
				<DropdownItem>Export</DropdownItem>
			</MenuBarItem>
			<MenuBarItem trigger="Edit">
				<DropdownItem>Preferences</DropdownItem>
			</MenuBarItem>
		</div>
	</>);
}
