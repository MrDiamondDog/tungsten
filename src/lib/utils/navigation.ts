import { Node } from "@/db/types";
import { FileTree } from "./data";

export function getFileUrl(node: Node, nodes: Node[]) {
	const path: Node[] = [node];

	while (path[0]?.parentNode !== null) {
		const last = path[0];
		path.unshift(nodes.find(node => node.id === last.parentNode)!);
	}

	const pathStr = `/editor/${path.map(n => encodeURIComponent(n.name)).join("/")}`;

	return pathStr;
}

export function getAllFilePaths(tree: FileTree, path?: string): string[] {
	let currentPath = path ?? "";
	const paths = [];

	for (const node of tree) {
		if (node.nodeType === "folder")
			paths.push(...getAllFilePaths(node.children!, `${currentPath}/${node.name}`));
		else
			paths.push(`${currentPath}/${node.name}`);
	}

	return paths;
}
