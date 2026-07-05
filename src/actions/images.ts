"use server";

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { auth } from "@/auth";
import { ActionRes } from ".";
import { randomUUID } from "crypto";
import { db, images } from "@/db/schema";

export default async function uploadImage(image: File): ActionRes<string> {
	if (process.env.IS_DEMO === "true")
		throw "Image uploading is disabled in the demo.";

	const user = await auth();

	if (!user?.user)
		throw "Not authenticated";

	if ((image.size / 1024 / 1024) > (parseInt(process.env.IMAGE_MAX_SIZE ?? "20")))
		throw `File is too large (must be less than ${process.env.IMAGE_MAX_SIZE}mb)`;

	if (!image || !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(image.type))
		throw "Invalid fields";

	const uuid = randomUUID();

	if (!existsSync(`./data/images/${user.user.id}`))
		mkdirSync(`./data/images/${user.user.id}`, { recursive: true });

	const fileName = `${uuid}.${image.type.split("/")[1]}`;
	writeFileSync(`./data/images/${user.user.id}/${fileName}`, await image.bytes());

	await db.insert(images).values({ fileName, userId: user.user.id! });

	return `/api/image/${fileName}`;
}
