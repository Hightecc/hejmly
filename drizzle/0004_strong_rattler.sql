CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`minutes` integer NOT NULL,
	`serves` integer NOT NULL,
	`ingredients_json` text NOT NULL,
	`steps_json` text NOT NULL,
	`created_by_user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `recipes_created_at_idx` ON `recipes` (`created_at`);--> statement-breakpoint
CREATE INDEX `recipes_category_idx` ON `recipes` (`category`);