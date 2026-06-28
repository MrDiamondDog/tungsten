import { AnySQLiteColumn, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({
	url: process.env.DB_FILE_NAME!,
});
export const db = drizzle(client);

export const users = sqliteTable("user", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: text("email")
		.unique(),
	password: text("password"),
});

export const nodes = sqliteTable("node", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("userId")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	nodeType: text("nodeType", { enum: ["file", "folder"] }).notNull(),
	parentNode: text("parentNode").references((): AnySQLiteColumn => nodes.id, { onDelete: "cascade" }),
	index: integer("index").notNull(),
	name: text("name").notNull(),
});

export const fileContents = sqliteTable("fileContent", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("userId")
		.references(() => users.id)
		.notNull(),
	nodeId: text("nodeId")
		.references(() => nodes.id, { onDelete: "cascade" })
		.notNull(),
	content: text("content").notNull(),
});

export const images = sqliteTable("image", {
	fileName: text("fileName").primaryKey()
		.notNull(),
	userId: text("userId")
		.references(() => users.id)
		.notNull(),
});
