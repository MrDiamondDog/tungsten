"use server";

import { auth } from "@/auth";
import { db, fileContents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ActionRes } from ".";
import { FileContent } from "@/db/types";

export async function getContent(nodeId: string): ActionRes<FileContent> {
	const user = await auth();

	if (!user?.user)
		return { error: "Not authenticated" };

	const content = (await db.select().from(fileContents)
		.where(eq(fileContents.nodeId, nodeId)))[0];

	if (!content) {
		return {
			data: (await db.insert(fileContents).values({
				userId: user.user.id!,
				nodeId,
				content: "",
			})
				.returning())[0],
		};
	}

	return { data: content };
}

export async function editContent(nodeId: string, newContent: string): ActionRes<FileContent> {
	const user = await auth();

	if (!user?.user)
		return { error: "Not authenticated" };

	const content = (await db.select().from(fileContents)
		.where(eq(fileContents.nodeId, nodeId)))[0];

	if (!content) {
		return {
			data: (await db.insert(fileContents).values({
				userId: user.user.id!,
				nodeId,
				content: newContent,
			})
				.returning())[0],
		};
	}

	const newData = (await db.update(fileContents).set({ content: newContent })
		.where(eq(fileContents.nodeId, nodeId))
		.returning())[0];

	return { data: newData };
}
