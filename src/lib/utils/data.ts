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

export function flattenTree(tree: FileTree): Node[] {
	const treeCopy = JSON.parse(JSON.stringify(tree)) as FileTree;
	const nodes: Node[] = [];

	for (const node of treeCopy) {
		if (node.nodeType === "file")
			nodes.push(node);
		else if (node.children) {
			nodes.push(...flattenTree(node.children));
			delete node.children;
			nodes.push(node);
		}
	}

	return nodes;
}
