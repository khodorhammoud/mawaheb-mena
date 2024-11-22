ALTER TABLE "accounts" ADD COLUMN "slug" varchar(60);--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_slug_unique" UNIQUE("slug");