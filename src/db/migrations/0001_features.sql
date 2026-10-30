CREATE TABLE `newsletter_issue` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`content` text NOT NULL,
	`sent_at` integer,
	`recipient_count` integer DEFAULT 0 NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `project_member` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_member_uidx` ON `project_member` (`project_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `project_member_user_idx` ON `project_member` (`user_id`);--> statement-breakpoint
ALTER TABLE `user` ADD `avatar_key` text;--> statement-breakpoint
ALTER TABLE `user` ADD `github_username` text;--> statement-breakpoint
ALTER TABLE `user` ADD `email_prefs` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `challenge` ADD `announced_at` integer;--> statement-breakpoint
ALTER TABLE `event` ADD `check_in_code` text;--> statement-breakpoint
ALTER TABLE `event` ADD `check_in_open` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `event` ADD `reminder_sent_at` integer;