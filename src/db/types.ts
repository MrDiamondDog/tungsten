import { users, nodes, fileContents } from "./schema";

export type User = typeof users.$inferSelect;
export type Node = typeof nodes.$inferSelect;
export type FileContent = typeof fileContents.$inferSelect;
