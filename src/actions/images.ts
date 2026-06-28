"use server";

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { auth } from "@/auth";
import { ActionRes } from ".";
import { randomUUID } from "crypto";
import { db, images } from "@/db/schema";

export default async function uploadImage(image: File): ActionRes<string> {
	const user = await auth();

	if (!user?.user)
		return { error: "Not authenticated" };

	if (!image || !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(image.type))
		return { error: "Invalid fields" };

	const uuid = randomUUID();

	if (!existsSync("./images"))
		mkdirSync("./images");

	if (!existsSync(`./images/${user.user.id}`))
		mkdirSync(`./images/${user.user.id}`);

	const fileName = `${uuid}.${image.type.split("/")[1]}`;
	writeFileSync(`./images/${user.user.id}/${fileName}`, await image.bytes());

	await db.insert(images).values({ fileName, userId: user.user.id! });

	return { data: `/api/image/${fileName}` };
}
