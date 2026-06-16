import { sqliteTable, text } from "drizzle-orm/sqlite-core";
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

export const files = sqliteTable("file", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("userId").notNull()
		.references(() => users.id),
	folderId: text("folderId").references(() => folders.id),
	name: text("name").notNull(),
	content: text("content").default("")
		.notNull(),
});

export const folders = sqliteTable("folder", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("userId").references(() => users.id)
		.notNull(),
	files: text("files", { mode: "json" }).default("[]")
		.$type<string[]>()
		.notNull(),
	name: text("name").notNull(),
});
