"use server";

import { auth } from "@/auth";
import { db, fileContents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ActionRes } from ".";
import { FileContent } from "@/db/types";
import { randomUUID } from "node:crypto";

export async function getContent(nodeId: string): ActionRes<FileContent> {
	const user = await auth();

	if (!user?.user)
		return { error: "Not authenticated" };

	if (process.env.NEXT_PUBLIC_IS_DEMO === "true" && nodeId !== "0")
		return {
			data: {
				id: randomUUID(),
				userId: user.user.id!,
				nodeId,
				content: "",
			},
		};

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

	if (process.env.NEXT_PUBLIC_IS_DEMO === "true")
		return {
			data: {
				id: randomUUID(),
				userId: user.user.id!,
				nodeId,
				content: newContent,
			},
		};

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
