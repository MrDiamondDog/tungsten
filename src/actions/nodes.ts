"use server";

import { auth } from "@/auth";
import { ActionRes } from ".";
import { db, nodes } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { Node } from "@/db/types";

export async function getNodes(): ActionRes<Node[]> {
	const user = await auth();

	if (!user?.user)
		return { error: "Not authenticated" };

	const nodeList = await db.select().from(nodes)
		.where(eq(nodes.userId, user.user.id!));

	return { data: nodeList };
}

export async function createNode(name: string, nodeType: "file" | "folder", parentNode?: string): ActionRes<Node> {
	const user = await auth();

	if (!user?.user)
		return { error: "Not authenticated" };

	if (!name)
		return { error: "Please fill out all fields" };

	if (nodeType !== "file" && nodeType !== "folder") {
		return { error: "Invalid node type." };
	}

	const nodeList = await db.select().from(nodes)
		.where(and(eq(nodes.userId, user.user.id!), !parentNode ? isNull(nodes.parentNode) : eq(nodes.parentNode, parentNode)));

	const index = (nodeList.map(node => node.index).sort()
		.reverse()[0] ?? 0) + 1;

	const node = await db.insert(nodes).values({
		name,
		nodeType,
		parentNode,
		index,
		userId: user.user.id!,
	})
		.returning()
		.then(res => ({ data: res[0] }))
		.catch(e => ({ error: e.toString() }));

	return node;
}

export async function editNode(id: string, newNode: Node): ActionRes<Node> {
	const user = await auth();

	if (!user?.user)
		return { error: "Not authenticated" };

	const node = (await db.select().from(nodes)
		.where(eq(nodes.id, id)))[0];

	if (!node)
		return { error: "Not found" };

	if (node.id !== newNode.id || node.userId !== node.userId)
		return { error: "Invalid fields" };

	const editedFile = (await db.update(nodes).set(newNode)
		.where(eq(nodes.id, id))
		.returning())[0];

	return { data: editedFile };
}
