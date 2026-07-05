"use client";

import Editor from "@/components/editor/Editor";
import MenuBar from "@/components/editor/MenuBar";
import { useTheme } from "@/components/theme/ThemeContext";

export default function EditorPage() {
	const { theme } = useTheme();

	return (
		<main className={`w-full h-full flex flex-col bg-ctp-base text-ctp-text ${theme}`}>
			<MenuBar />
			<Editor />
		</main>
	);
}
