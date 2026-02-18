CREATE TABLE `analyses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`repo_id` integer NOT NULL,
	`summary_ko` text,
	`summary_en` text,
	`tech_stack` text,
	`category` text,
	`use_cases` text,
	`similar_projects` text,
	`highlights` text,
	`difficulty` text,
	`model_version` text,
	`analyzed_at` text NOT NULL,
	FOREIGN KEY (`repo_id`) REFERENCES `repositories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_analysis_repo` ON `analyses` (`repo_id`);--> statement-breakpoint
CREATE TABLE `repositories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`language` text,
	`stars` integer DEFAULT 0 NOT NULL,
	`forks` integer DEFAULT 0 NOT NULL,
	`topics` text,
	`homepage` text,
	`license` text,
	`created_at` text,
	`pushed_at` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_repo_full_name` ON `repositories` (`full_name`);--> statement-breakpoint
CREATE INDEX `idx_repo_language` ON `repositories` (`language`);--> statement-breakpoint
CREATE TABLE `star_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`repo_id` integer NOT NULL,
	`date` text NOT NULL,
	`stars` integer NOT NULL,
	FOREIGN KEY (`repo_id`) REFERENCES `repositories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_star_history_repo_date` ON `star_history` (`repo_id`,`date`);--> statement-breakpoint
CREATE TABLE `trend_classifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`repo_id` integer NOT NULL,
	`date` text NOT NULL,
	`classification` text NOT NULL,
	`trend_score` real,
	`consecutive_days` integer,
	FOREIGN KEY (`repo_id`) REFERENCES `repositories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_trend_class_date` ON `trend_classifications` (`date`,`classification`);--> statement-breakpoint
CREATE TABLE `trending_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`repo_id` integer NOT NULL,
	`date` text NOT NULL,
	`period` text NOT NULL,
	`rank` integer,
	`stars_today` integer,
	`source` text DEFAULT 'scrape' NOT NULL,
	`collected_at` text NOT NULL,
	FOREIGN KEY (`repo_id`) REFERENCES `repositories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_snapshot_date_period` ON `trending_snapshots` (`date`,`period`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_snapshot_repo_date_period` ON `trending_snapshots` (`repo_id`,`date`,`period`);--> statement-breakpoint
CREATE TABLE `webhook_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`platform` text NOT NULL,
	`filters` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
