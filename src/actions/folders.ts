"use server";

import { Folder } from "@/db/types";
import { ActionRes } from ".";
import { auth } from "@/auth";
import { db, folders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getFolders(): ActionRes<Folder[]> {
	const user = await auth();

	if (!user?.user)
		return { error: "Not authenticated" };

	const folderList = await db.select().from(folders)
		.where(eq(folders.userId, user.user.id!));

	return { data: folderList };
}
