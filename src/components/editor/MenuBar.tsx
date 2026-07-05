"use client";

import { createNode } from "@/actions/nodes";
import {
	Dropdown, DropdownContent, DropdownItem, DropdownRadioItem, DropdownSeparator, DropdownTrigger,
} from "../primitives/Dropdown";
import { signOut } from "next-auth/react";
import { useEditor, useEditorDispatch } from "./EditorContext";
import { DropdownMenuRadioGroup } from "@radix-ui/react-dropdown-menu";
import { Theme, useTheme } from "../theme/ThemeContext";
import { throwToast } from "@/lib/utils/errors";

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
	const { viewMode } = useEditor();
	const { theme, setTheme } = useTheme();
	const dispatch = useEditorDispatch();

	if (process.env.IS_DEMO === "true")
		return null;

	async function onCreate(type: "folder" | "file") {
		const nodeData = {
			parentNode: null,
			nodeType: type,
			name: `New ${type === "file" ? "File" : "Folder"}`,
		};

		const newNode = await createNode(nodeData).catch(e => throwToast("Could not create node", e));

		dispatch?.({ type: "create-node", node: newNode });
	}

	return (<>
		<div className="w-full p-1 border-b border-ctp-surface0 flex gap-1 items-center">
			<MenuBarItem trigger={<img src="/tungsten.svg" width={32} height={32} />} className="px-1! py-0!">
				<DropdownItem>Options</DropdownItem>
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
				<DropdownItem>Rename</DropdownItem>
				<DropdownItem>Delete</DropdownItem>
			</MenuBarItem>
			<MenuBarItem trigger="View">
				<DropdownMenuRadioGroup
					value={viewMode}
					onValueChange={v => dispatch?.({ type: "update-view-mode", viewMode: v as "normal" | "raw" | "readonly" })}
				>
					<DropdownRadioItem value="normal">Normal</DropdownRadioItem>
					<DropdownRadioItem value="raw">Raw</DropdownRadioItem>
					<DropdownRadioItem value="readonly">Read Only</DropdownRadioItem>
				</DropdownMenuRadioGroup>
				<DropdownSeparator />
				<DropdownMenuRadioGroup
					value={theme}
					onValueChange={v => setTheme(v as Theme)}
				>
					<DropdownRadioItem value="mocha">Mocha</DropdownRadioItem>
					<DropdownRadioItem value="macchiato">Macchiato</DropdownRadioItem>
					<DropdownRadioItem value="frappe">Frappé</DropdownRadioItem>
					<DropdownRadioItem value="latte">Latte</DropdownRadioItem>
				</DropdownMenuRadioGroup>
			</MenuBarItem>
		</div>
	</>);
}
