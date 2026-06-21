CREATE TABLE `fileContent` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`nodeId` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`nodeId`) REFERENCES `node`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `node` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`nodeType` text NOT NULL,
	`parentNode` text,
	`index` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parentNode`) REFERENCES `node`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`password` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);