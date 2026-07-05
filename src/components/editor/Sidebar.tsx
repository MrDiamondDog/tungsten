"use client";

import { FileIcon, Folder, FolderOpen } from "lucide-react";
import { useEditor, useEditorDispatch } from "./EditorContext";
import { CreateHandler, MoveHandler, RenameHandler, SimpleTree, Tree, TreeApi } from "react-arborist";
import { FileTree, flattenTree, getTree, TreeItem } from "@/lib/utils/data";
import { RefObject, useEffect, useRef, useState } from "react";
import { createNode, deleteNode, editNode, editNodesBulk } from "@/actions/nodes";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../primitives/ContextMenu";
import Input from "../primitives/Input";
import { Node } from "@/db/types";
import { folderContents } from "@/lib/utils/navigation";
import { throwToast } from "@/lib/utils/errors";

export function SidebarFile({
	data,
	isFolder,
	selected,
	onEdit,
	treeRef,
	...props
}: {
	data: TreeItem,
	selected?: boolean,
	isFolder?: boolean,
	onEdit?: () => void,
	treeRef: RefObject<TreeApi<TreeItem> | undefined>,
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const dispatch = useEditorDispatch();

	function onDelete() {
		deleteNode(data.id).catch(e => throwToast("Could not delete node", e));
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
					<ContextMenuItem onClick={() => treeRef.current?.create({ type: "leaf", parentId: data.id })}>New File</ContextMenuItem>
					<ContextMenuItem onClick={() => treeRef.current?.create({ type: "internal", parentId: data.id })}>New Folder</ContextMenuItem>
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
	const { nodes, selectedFile } = useEditor();
	const dispatch = useEditorDispatch();
	const [tree, setTree] = useState<FileTree>();

	const treeRef = useRef<TreeApi<TreeItem> | undefined>(undefined);
	const nodeListRef = useRef(nodes);

	useEffect(() => {
		nodeListRef.current = nodes;
	}, [nodes]);

	function onFileClick(file: Node) {
		dispatch?.({ type: "open-file", file: file.id });
		dispatch?.({ type: "select-file", file: file.id });
	}

	// eslint-disable-next-line func-style
	const onMove: MoveHandler<TreeItem> = ({ dragIds, dragNodes, parentId, parentNode, index }) => {
		if (!tree)
			return;

		const treeData = new SimpleTree(getTree(nodeListRef.current));
		for (const id of dragIds) {
			treeData.move({ id, parentId, index });
		}

		const newTree: FileTree = [...treeData.data];

		function updateNodes(nodes: TreeItem[], parentNode?: string): boolean {
			for (let i = 0; i < nodes.length; i++) {
				const node = nodes[i];
				if (nodes.filter(n => n.id !== node.id).map(n => n.name)
					.includes(node.name))
					return false;

				node.index = i;
				node.parentNode = parentNode ?? null;
				if (node.nodeType === "folder") {
					node.children = node.children ?? [];
					if (!updateNodes(node.children, node.id))
						return false;
				}
			}
			return true;
		}

		if (!updateNodes(newTree))
			throwToast("Could not move items", "Folder contains item of the same name.");

		setTree(newTree);

		const newNodes = flattenTree(newTree);
		editNodesBulk(newNodes).catch(e => throwToast("Unable to edit nodes", e));
		dispatch?.({ type: "set-nodes", nodes: newNodes });
	};

	// eslint-disable-next-line func-style
	const onRename: RenameHandler<TreeItem> = ({ node, name }) => {
		if (!name)
			name = `New ${node.isLeaf ? "File" : "Folder"}`;

		if (folderContents(nodeListRef.current, node.parent?.id).filter(n => n.id !== node.id)
			.find(n => n.name === name))
			throwToast("Folder contains item of the same name.");

		editNode(node.data.id, { ...node.data, name }).catch(e => throwToast("Unable to edit node", e));
		dispatch?.({ type: "edit-node", node: { ...node.data, name } });
	};

	// eslint-disable-next-line func-style
	const onCreate: CreateHandler<TreeItem> = async ({ index, parentId, type }) => {
		let name = `New ${type === "leaf" ? "File" : "Folder"}`;
		let i = 1;
		while (folderContents(nodeListRef.current, parentId).find(n => n.name === name)) {
			name = `New ${type === "leaf" ? "File" : "Folder"} ${i}`;
			i++;
		}

		const nodeData = {
			parentNode: parentId,
			nodeType: (type === "leaf" ? "file" : "folder") as "file" | "folder",
			name,
		};

		const newNode = await createNode(nodeData, index).catch(e => throwToast("Could not create node", e));

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
									onClick={() => onFileClick(node.data)}
									selected={selectedFile === node.data.id}
									style={style}
									onEdit={() => node.edit()}
									data={node.data}
									treeRef={treeRef}
								/> :
								<SidebarFile
									isFolder
									selected={node.isOpen}
									onClick={() => (node.isOpen ? node.close() : node.open())}
									style={style}
									onEdit={() => node.edit()}
									data={node.data}
									treeRef={treeRef}
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
				<ContextMenuItem onClick={() => treeRef.current?.create({ type: "leaf", parentId: null })}>New File</ContextMenuItem>
				<ContextMenuItem onClick={() => treeRef.current?.create({ type: "internal", parentId: null })}>New Folder</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
