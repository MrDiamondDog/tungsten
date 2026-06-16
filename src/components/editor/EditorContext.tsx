import { getFiles } from "@/actions/files";
import { getFolders } from "@/actions/folders";
import { File, Folder } from "@/db/types";
import { ActionDispatch, createContext, useContext, useEffect, useReducer } from "react";

export type EditorData = { files: File[], folders: Folder[], selectedFile?: string, openFiles: string[] }

export type EditorAction =
	{ type: "create-file", file: File } |
	{ type: "edit-file", file: File } |
	{ type: "delete-file", file: File } |
	{ type: "select-file", file?: string } |
	{ type: "open-file", file: string } |
	{ type: "close-file", file: string } |
	{ type: "create-folder", folder: Folder } |
	{ type: "edit-folder", folder: Folder } |
	{ type: "delete-folder", folder: Folder } |
	{ type: "set-files", files: File[] } |
	{ type: "set-folders", folders: Folder[] } |
	{ type: "set-data", data: EditorData };

function editorReducer(data: EditorData, action: EditorAction): EditorData {
	switch (action.type) {
		case "create-file": {
			return { ...data, files: [...data.files, action.file] };
		}
		case "edit-file": {
			const fileIndex = data.files.findIndex(f => f.id === action.file.id);
			console.log(action.file, fileIndex);
			return { ...data, files: [...data.files.slice(0, fileIndex), action.file, ...data.files.slice(fileIndex + 1)] };
		}
		case "delete-file": {
			const fileIndex = data.files.findIndex(f => f.id === action.file.id);
			return { ...data, files: [...data.files.slice(0, fileIndex), ...data.files.slice(fileIndex + 1)] };
		}
		case "create-folder": {
			return { ...data, folders: [...data.folders, action.folder] };
		}
		case "edit-folder": {
			const folderIndex = data.folders.findIndex(f => f.id === action.folder.id);
			return {
				...data, folders: [...data.folders.slice(0, folderIndex), action.folder, ...data.folders.slice(folderIndex + 1)],
			};
		}
		case "delete-folder": {
			const folderIndex = data.files.findIndex(f => f.id === action.folder.id);
			return { ...data, folders: [...data.folders.slice(0, folderIndex), ...data.folders.slice(folderIndex + 1)] };
		}
		case "select-file": {
			return { ...data, selectedFile: action.file };
		}
		case "open-file": {
			return { ...data, openFiles: [...data.openFiles, action.file] };
		}
		case "close-file": {
			const fileIndex = data.openFiles.findIndex(f => f === action.file);
			return { ...data, openFiles: [...data.openFiles.slice(0, fileIndex), ...data.openFiles.slice(fileIndex + 1)] };
		}
		case "set-files": {
			console.log(action.files);
			return { ...data, files: action.files };
		}
		case "set-folders": {
			return { ...data, folders: action.folders };
		}
		case "set-data": {
			return action.data;
		}
	}
}

export const EditorContext = createContext<EditorData>({ files: [], folders: [], openFiles: [] });
export const EditorDispatchContext = createContext<ActionDispatch<[EditorAction]> | null>(null);

export function EditorProvider({ children }: React.PropsWithChildren) {
	const [data, dispatch] = useReducer(editorReducer, { files: [], folders: [], openFiles: [] } as EditorData);

	useEffect(() => {
		getFiles().then(res => {
			if (!res.error)
				dispatch?.({ type: "set-files", files: res.data! });
		});

		getFolders().then(res => {
			if (!res.error)
				dispatch?.({ type: "set-folders", folders: res.data! });
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
