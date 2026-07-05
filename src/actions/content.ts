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
		throw "Not authenticated";

	if (process.env.IS_DEMO === "true" && nodeId !== "0") {
		return {
			id: randomUUID(),
			userId: user.user.id!,
			nodeId,
			content: "",
		};
	}

	if (process.env.IS_DEMO === "true" && nodeId === "0") {
		const res = await fetch("https://raw.githubusercontent.com/MrDiamondDog/tungsten/refs/heads/master/DEMO_README.md").then(res => res.text());
		return {
			id: randomUUID(),
			userId: user.user.id!,
			nodeId,
			content: res,
		};
	}

	const content = (await db.select().from(fileContents)
		.where(eq(fileContents.nodeId, nodeId)))[0];

	if (!content) {
		return (await db.insert(fileContents).values({
			userId: user.user.id!,
			nodeId,
			content: "",
		})
			.returning())[0];
	}

	return content;
}

export async function editContent(nodeId: string, newContent: string): ActionRes<FileContent> {
	const user = await auth();

	if (!user?.user)
		throw "Not authenticated";

	if (process.env.IS_DEMO === "true")
		return {
			id: randomUUID(),
			userId: user.user.id!,
			nodeId,
			content: newContent,
		};

	const content = (await db.select().from(fileContents)
		.where(eq(fileContents.nodeId, nodeId)))[0];

	if (!content) {
		return (await db.insert(fileContents).values({
			userId: user.user.id!,
			nodeId,
			content: newContent,
		})
			.returning())[0];
	}

	const newData = (await db.update(fileContents).set({ content: newContent })
		.where(eq(fileContents.nodeId, nodeId))
		.returning())[0];

	return newData;
}
