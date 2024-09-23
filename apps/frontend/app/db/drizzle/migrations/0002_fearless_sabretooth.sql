ALTER TABLE "employer_industries" RENAME COLUMN "created_at" TO "timestamp";--> statement-breakpoint
ALTER TABLE "employer_industries" DROP COLUMN IF EXISTS "updated_at";--> statement-breakpoint
ALTER TABLE "employer_industries" DROP COLUMN IF EXISTS "deleted_at";--> statement-breakpoint
ALTER TABLE "employer_industries" DROP COLUMN IF EXISTS "is_deleted";