"use client";

import { FileIcon, Folder, FolderOpen } from "lucide-react";
import { useEditor, useEditorDispatch } from "./EditorContext";
import { MoveHandler, SimpleTree, Tree, TreeApi } from "react-arborist";
import { FileTree, flattenTree, getTree, TreeItem } from "@/lib/utils/data";
import { useEffect, useRef, useState } from "react";
import { editNodesBulk } from "@/actions/nodes";

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
		w-full text-left py-1 cursor-pointer transition-colors flex justify-between items-center`}
			{...props}
		>
			<div className="flex gap-1 items-center px-2">
				{folder ? (
					selected ? <FolderOpen size={18} /> : <Folder size={18} />
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

	const treeRef = useRef<TreeApi<TreeItem> | undefined>(undefined);

	function onFileClick(file: string) {
		if (!openFiles.includes(file))
			dispatch?.({ type: "open-file", file });

		dispatch?.({ type: "select-file", file });
	}

	// eslint-disable-next-line func-style
	const onMove: MoveHandler<TreeItem> = ({ dragIds, dragNodes, parentId, parentNode, index }) => {
		if (!tree)
			return;

		const treeData = new SimpleTree(tree);
		for (const id of dragIds) {
			treeData.move({ id, parentId, index });
		}

		const newTree: FileTree = treeData.data;

		function updateNodes(nodes: TreeItem[], parentNode?: string) {
			for (let i = 0; i < nodes.length; i++) {
				const node = nodes[i];
				node.index = i;
				node.parentNode = parentNode ?? null;
				if (node.nodeType === "folder") {
					node.children = node.children ?? [];
					updateNodes(node.children, node.id);
				}
			}
		}

		updateNodes(newTree);
		setTree(newTree);

		const newNodes = flattenTree(newTree);
		dispatch?.({ type: "set-nodes", nodes: newNodes });
		editNodesBulk(newNodes);
	};

	useEffect(() => {
		setTree(getTree(nodes, null));
	}, [nodes]);

	return (
		<div className="w-fit min-w-60 h-full p-2 border-r border-ctp-surface0">
			<Tree data={tree} rowHeight={32} indent={16} width="fit" ref={treeRef} onMove={onMove}>
				{({ node, dragHandle, style }) => (<div ref={dragHandle} key={node.data.id}>
					{node.isLeaf ?
						<SidebarFile onClick={() => onFileClick(node.data.id)} selected={selectedFile === node.data.id} style={style}>
							{node.data.name}
						</SidebarFile> :
						<SidebarFile folder selected={node.isOpen} onClick={() => (node.isOpen ? node.close() : node.open())} style={style}>
							{node.data.name}
						</SidebarFile>
					}
				</div>)}
			</Tree>
		</div>
	);
}
