import { auth } from "@/auth";
import { EditorProvider } from "@/components/editor/EditorContext";
import { redirect } from "next/navigation";

export default async function EditorLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();

	if (!session || !session.user)
		return redirect("/auth");

	return <EditorProvider>
		{children}
	</EditorProvider>;
}
