import { Node } from "@/db/types";

export type TreeItem = Node & { children?: FileTree };
export type FileTree = TreeItem[];

export function getTree(nodes: Node[], parentId: string | null): FileTree {
	const tree: FileTree = [];

	for (const node of nodes.filter(f => f.parentNode === parentId)) {
		if (node.nodeType === "folder")
			tree.push({ ...node, children: getTree(nodes, node.id) });
		else
			tree.push(node);
	}

	tree.sort((a, b) => a.index - b.index);

	return tree;
}

export function getMaxIndex(files: Node[]): number {
	return files.map(f => f.index).sort()[0];
}
