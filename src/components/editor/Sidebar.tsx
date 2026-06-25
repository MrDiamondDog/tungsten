"use client";

import { FileIcon, Folder, FolderOpen } from "lucide-react";
import { useEditor, useEditorDispatch } from "./EditorContext";
import { CreateHandler, MoveHandler, RenameHandler, SimpleTree, Tree, TreeApi } from "react-arborist";
import { FileTree, flattenTree, getTree, TreeItem } from "@/lib/utils/data";
import { useEffect, useRef, useState } from "react";
import { createNode, deleteNode, editNode, editNodesBulk } from "@/actions/nodes";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../primitives/ContextMenu";
import Input from "../primitives/Input";

export function SidebarFile({
	data,
	isFolder,
	selected,
	onEdit,
	...props
}: {
	data: TreeItem,
	selected?: boolean,
	isFolder?: boolean,
	onEdit?: () => void,
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const dispatch = useEditorDispatch();

	function onDelete() {
		deleteNode(data.id);
		dispatch?.({ type: "delete-node", node: data });
	}

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<button
					className={`${(selected && !isFolder) ? "bg-ctp-surface0" : "hover:bg-ctp-surface0"}
		w-full text-left py-1 cursor-pointer transition-colors flex justify-between items-center outline-none`}
					{...props}
				>
					<div className="flex gap-1 items-center px-2">
						{isFolder ? (
							selected ? <FolderOpen size={18} /> : <Folder size={18} />
						) : (
							<FileIcon size={18} />
						)}{" "}
						{data.name}
					</div>
				</button>
			</ContextMenuTrigger>
			<ContextMenuContent>
				{isFolder && <>
					<ContextMenuItem>New File</ContextMenuItem>
					<ContextMenuItem>New Folder</ContextMenuItem>
					<ContextMenuSeparator />
				</>}
				<ContextMenuItem onClick={onEdit}>Rename</ContextMenuItem>
				<ContextMenuItem onClick={onDelete}>Delete</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}

export function SidebarFileEdit({ initialName, onEditFinish, isFolder }: {
	initialName: string,
	onEditFinish?: (name: string) => void,
	isFolder?: boolean
}) {
	const [name, setName] = useState(initialName);

	function submit(esc?: boolean) {
		if (esc)
			return void onEditFinish?.(initialName);

		if (!name)
			return;

		onEditFinish?.(name.trim());
	}

	return <div className="w-full text-left py-1 cursor-pointer transition-colors flex justify-between items-center">
		<div className="flex gap-1 items-center px-2">
			{isFolder ? <Folder size={18} /> : <FileIcon size={18} />}{" "}
			<Input value={name} onChange={setName} onKeyDown={e => (e.key === "Enter" || e.key === "Escape") && submit(e.key === "Escape")}
				onBlur={() => submit()} className="h-fit py-0 px-1" autoFocus id="rename-input" onFocus={e => e.target.select()} />
		</div>
	</div>;
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

	// eslint-disable-next-line func-style
	const onRename: RenameHandler<TreeItem> = ({ node, name }) => {
		if (!name)
			name = `New ${node.isLeaf ? "File" : "Folder"}`;

		dispatch?.({ type: "edit-node", node: { ...node.data, name } });
		editNode(node.data.id, { ...node.data, name });
	};

	// eslint-disable-next-line func-style
	const onCreate: CreateHandler<TreeItem> = async ({ index, parentId, type }) => {
		const nodeData = {
			parentNode: parentId,
			nodeType: (type === "leaf" ? "file" : "folder") as "file" | "folder",
			name: `New ${type === "leaf" ? "File" : "Folder"}`,
		};

		const newNode = await createNode(nodeData, index).then(res => {
			if (res.error)
				throw res.error;

			return res.data!;
		});

		dispatch?.({ type: "create-node", node: newNode });
		return newNode;
	};

	useEffect(() => {
		setTree(getTree(nodes, null));
	}, [nodes]);

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div className="w-fit min-w-75 h-full p-2 border-r border-ctp-surface0">
					<Tree data={tree} rowHeight={32} indent={16} width="fit" ref={treeRef} onMove={onMove} onRename={onRename} onCreate={onCreate}>
						{({ node, dragHandle, style }) => (<div ref={dragHandle} key={node.data.id}>
							{!node.isEditing && (node.isLeaf ?
								<SidebarFile
									onClick={() => onFileClick(node.data.id)}
									selected={selectedFile === node.data.id}
									style={style}
									onEdit={() => node.edit()}
									data={node.data}
								/> :
								<SidebarFile
									isFolder
									selected={node.isOpen}
									onClick={() => (node.isOpen ? node.close() : node.open())}
									style={style}
									onEdit={() => node.edit()}
									data={node.data}
								/>
							)}
							{node.isEditing && <SidebarFileEdit
								isFolder={!node.isLeaf}
								initialName={node.data.name}
								onEditFinish={name => node.submit(name)}
							/>}
						</div>)}
					</Tree>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={() => treeRef.current?.create({ type: "leaf" })}>New File</ContextMenuItem>
				<ContextMenuItem onClick={() => treeRef.current?.create({ type: "internal" })}>New Folder</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
