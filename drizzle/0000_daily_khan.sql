CREATE TABLE `fileContent` (
	`id` text PRIMARY KEY NOT NULL,
	`fileId` text NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`fileId`) REFERENCES `file`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `file` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`folderId` text,
	`name` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`folderId`) REFERENCES `folder`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `folder` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`files` text DEFAULT '[]' NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`password` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);