"use server";

import { auth } from "@/auth";
import { ActionRes } from ".";
import { File } from "@/db/types";
import { db, files } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getFiles(): ActionRes<File[]> {
	const user = await auth();

	if (!user?.user)
		return { error: "Not authenticated" };

	const fileList = await db.select().from(files)
		.where(eq(files.userId, user.user.id!));

	return { data: fileList };
}

export async function createFile(name: string): ActionRes<File> {
	const user = await auth();

	if (!user?.user)
		return { error: "Not authenticated" };

	if (!name)
		return { error: "Please fill out all fields" };

	const file = await db.insert(files).values({
		name,
		userId: user.user.id!,
	})
		.returning()
		.then(res => ({ data: res[0] }))
		.catch(e => ({ error: e.toString() }));

	return file;
}

export async function editFile(id: string, newFile: File): ActionRes<File> {
	const user = await auth();

	if (!user?.user)
		return { error: "Not authenticated" };

	const file = (await db.select().from(files)
		.where(eq(files.id, id)))[0];

	if (!file)
		return { error: "Not found" };

	if (file.id !== newFile.id || file.userId !== file.userId)
		return { error: "Invalid fields" };

	const editedFile = (await db.update(files).set(newFile)
		.where(eq(files.id, id))
		.returning())[0];

	return { data: editedFile };
}
