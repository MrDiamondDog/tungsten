"use client";

import { ChevronRight, FileIcon } from "lucide-react";
import { useEditor, useEditorDispatch } from "./EditorContext";
import { MoveHandler, Tree } from "react-arborist";
import { FileTree, getTree, TreeItem } from "@/lib/utils/data";
import { useEffect, useState } from "react";

export function SidebarFile({
	children,
	folder,
	selected,
	...props
}: { selected?: boolean; folder?: boolean } & React.PropsWithChildren &
	React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={`${(selected && !folder) ? "bg-ctp-surface0" : "hover:bg-ctp-surface0"}
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
		</button>
	);
}

export default function Sidebar() {
	const { nodes, openFiles, selectedFile } = useEditor();
	const dispatch = useEditorDispatch();
	const [tree, setTree] = useState<FileTree>();

	function onFileClick(file: string) {
		if (!openFiles.includes(file))
			dispatch?.({ type: "open-file", file });

		dispatch?.({ type: "select-file", file });
	}

	// eslint-disable-next-line func-style
	const onMove: MoveHandler<TreeItem> = ({ dragIds, dragNodes, parentId, parentNode, index }) => {
		console.log("nodes", dragNodes.map(node => node.data.name), "parent", parentNode?.data.name, index);
	};

	useEffect(() => {
		setTree(getTree(nodes, null));
	}, [nodes]);

	return (
		<div className="w-fit min-w-60 h-full p-2 border-r border-ctp-surface0">
			<Tree data={tree} rowHeight={36} openByDefault width="fit" onMove={onMove}>
				{({ node, dragHandle }) => (<div ref={dragHandle} key={node.data.id}>
					{node.isLeaf ?
						<SidebarFile onClick={() => onFileClick(node.data.id)} selected={selectedFile === node.data.id}>
							{node.data.name}
						</SidebarFile> :
						<SidebarFile folder selected={node.isOpen} onClick={() => (node.isOpen ? node.close() : node.open())}>
							{node.data.name}
						</SidebarFile>
					}
				</div>)}
			</Tree>
		</div>
	);
}
