import { Node } from "@/db/types";

export function openFile(node: Node, nodes: Node[]) {
	const path: Node[] = [node];

	while (path[0]?.parentNode !== null) {
		const last = path[path.length - 1];
		path.unshift(nodes.find(node => node.id === last.parentNode)!);
	}

	const pathStr = `/editor/${path.map(n => encodeURIComponent(n.name)).join("/")}`;

	return pathStr;
}
