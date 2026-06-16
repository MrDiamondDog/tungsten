import { folders, fileContent, files, users } from "./schema";

export type User = typeof users.$inferSelect;
export type File = typeof files.$inferSelect;
export type FileContent = typeof fileContent.$inferSelect;
export type Folder = typeof folders.$inferSelect;
