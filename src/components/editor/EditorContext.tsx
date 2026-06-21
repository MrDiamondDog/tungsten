import { getNodes } from "@/actions/nodes";
import { Node } from "@/db/types";
import { ActionDispatch, createContext, useContext, useEffect, useReducer } from "react";

export type EditorData = {
	nodes: Node[],
	cachedContent: Record<string, string>,
	selectedFile?: string,
	openFiles: string[],
	unsavedFiles: string[],
}

export type EditorAction =
	{ type: "set-data", data: EditorData } |
	{ type: "create-node", node: Node } |
	{ type: "edit-node", node: Node } |
	{ type: "delete-node", node: Node } |
	{ type: "set-nodes", nodes: Node[] } |
	{ type: "select-file", file?: string } |
	{ type: "open-file", file: string } |
	{ type: "close-file", file: string } |
	{ type: "unsaved-file", file: string } |
	{ type: "saved-file", file: string } |
	{ type: "cache-content", nodeId: string, content: string };

function editorReducer(data: EditorData, action: EditorAction): EditorData {
	switch (action.type) {
		case "create-node": {
			return { ...data, nodes: [...data.nodes, action.node] };
		}
		case "edit-node": {
			const nodeIndex = data.nodes.findIndex(f => f.id === action.node.id);
			return { ...data, nodes: [...data.nodes.slice(0, nodeIndex), action.node, ...data.nodes.slice(nodeIndex + 1)] };
		}
		case "delete-node": {
			const nodeIndex = data.nodes.findIndex(f => f.id === action.node.id);
			return { ...data, nodes: [...data.nodes.slice(0, nodeIndex), ...data.nodes.slice(nodeIndex + 1)] };
		}
		case "select-file": {
			return { ...data, selectedFile: action.file };
		}
		case "open-file": {
			return { ...data, openFiles: [...data.openFiles, action.file] };
		}
		case "close-file": {
			const fileIndex = data.openFiles.findIndex(f => f === action.file);
			const newOpenFiles = [...data.openFiles.slice(0, fileIndex), ...data.openFiles.slice(fileIndex + 1)];
			if (action.file === data.selectedFile)
				data.selectedFile = newOpenFiles[0] ?? undefined;
			return { ...data, openFiles: newOpenFiles };
		}
		case "unsaved-file": {
			if (data.unsavedFiles.includes(action.file))
				return data;
			return { ...data, unsavedFiles: [...data.unsavedFiles, action.file] };
		}
		case "saved-file": {
			const fileIndex = data.unsavedFiles.findIndex(f => f === action.file);
			return { ...data, unsavedFiles: [...data.unsavedFiles.slice(0, fileIndex), ...data.unsavedFiles.slice(fileIndex + 1)] };
		}
		case "set-nodes": {
			return { ...data, nodes: action.nodes };
		}
		case "set-data": {
			return action.data;
		}
		case "cache-content": {
			return { ...data, cachedContent: { ...data.cachedContent, [action.nodeId]: action.content } };
		}
	}
}

export const EditorContext = createContext<EditorData>({ nodes: [], openFiles: [], unsavedFiles: [], cachedContent: {} });
export const EditorDispatchContext = createContext<ActionDispatch<[EditorAction]> | null>(null);

export function EditorProvider({ children }: React.PropsWithChildren) {
	const [data, dispatch] = useReducer(editorReducer, { nodes: [], openFiles: [], unsavedFiles: [], cachedContent: {} } as EditorData);

	useEffect(() => {
		getNodes().then(res => {
			if (!res.error)
				dispatch?.({ type: "set-nodes", nodes: res.data! });
		});
	}, []);

	return (<EditorContext value={data}>
		<EditorDispatchContext value={dispatch}>
			{children}
		</EditorDispatchContext>
	</EditorContext>);
}

export function useEditor() {
	return useContext(EditorContext);
}

export function useEditorDispatch() {
	return useContext(EditorDispatchContext);
}
