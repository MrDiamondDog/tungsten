"use client";

import Editor from "@/components/editor/Editor";
import { EditorProvider } from "@/components/editor/EditorContext";
import MenuBar from "@/components/editor/MenuBar";
import Spinner from "@/components/primitives/Spinner";
import { useSession } from "next-auth/react";
import { Suspense } from "react";

export default function EditorPage() {
	const session = useSession();

	if (!session)
		return null;

	return (
		<main className="w-full h-full flex flex-col">
			<Suspense fallback={<Spinner className="absolute-center" />}>
				<EditorProvider>
					<MenuBar />
					<Editor />
				</EditorProvider>
			</Suspense>
		</main>
	);
}
