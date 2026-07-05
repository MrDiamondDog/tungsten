"use server";

import { auth } from "@/auth";
import { ActionRes } from ".";
import { db, nodes } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { Node } from "@/db/types";
import { randomUUID } from "node:crypto";

export async function getNodes(): ActionRes<Node[]> {
	const user = await auth();

	if (!user?.user)
		throw "Not authenticated";

	const nodeList = await db.select().from(nodes)
		.where(eq(nodes.userId, user.user.id!));

	return nodeList;
}

export async function createNode(data: Omit<Node, "id" | "userId" | "index">, index?: number): ActionRes<Node> {
	const user = await auth();

	if (!user?.user)
		throw "Not authenticated";

	if (!data.name)
		throw "Please fill out all fields";

	if (data.nodeType !== "file" && data.nodeType !== "folder") {
		throw "Invalid node type.";
	}

	if (!index) {
		const nodeList = await db.select().from(nodes)
			.where(and(eq(nodes.userId, user.user.id!), !data.parentNode ? isNull(nodes.parentNode) : eq(nodes.parentNode, data.parentNode)));

		index = (nodeList.map(node => node.index).sort()
			.reverse()[0] ?? -1) + 1;
	}

	if (process.env.IS_DEMO === "true") {
		return {
			...data,
			id: randomUUID(),
			userId: user.user.id!,
			index,
		};
	}

	const node = (await db.insert(nodes).values({
		...data,
		index,
		userId: user.user.id!,
	})
		.returning())[0];

	return node;
}

export async function editNode(id: string, newNode: Node): ActionRes<Node> {
	const user = await auth();

	if (!user?.user)
		throw "Not authenticated";

	const node = (await db.select().from(nodes)
		.where(eq(nodes.id, id)))[0];

	if (!node)
		throw "Not found";

	if (node.id !== newNode.id || node.userId !== node.userId)
		throw "Invalid fields";

	if (process.env.IS_DEMO === "true")
		return newNode;

	const editedNode = (await db.update(nodes).set(newNode)
		.where(eq(nodes.id, id))
		.returning())[0];

	return editedNode;
}

export async function editNodesBulk(newNodes: Node[]): ActionRes<Node[]> {
	const user = await auth();

	if (!user?.user)
		throw "Not authenticated";

	const editedNodes = await Promise.all(newNodes.map(newNode => new Promise<Node>(async resolve => {
		if (process.env.IS_DEMO === "true")
			return newNode;

		const node = (await db.select().from(nodes)
			.where(eq(nodes.id, newNode.id)))[0];

		if (!node)
			throw "Not found";

		if (node.id !== newNode.id || node.userId !== newNode.userId)
			throw "Invalid fields";

		resolve((await db.update(nodes).set(newNode)
			.where(eq(nodes.id, node.id))
			.returning())[0]);
	})));

	return editedNodes;
}

export async function deleteNode(id: string): ActionRes<void> {
	const user = await auth();

	if (!user?.user)
		throw "Not authenticated";

	if (process.env.IS_DEMO === "true")
		return;

	const node = (await db.select().from(nodes)
		.where(eq(nodes.id, id)))[0];

	if (!node)
		throw "Not found";

	if (node.userId !== node.userId)
		throw "Invalid fields";

	await db.delete(nodes).where(eq(nodes.id, id));

	return;
}
