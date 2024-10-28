ALTER TABLE "job_categories" DROP CONSTRAINT "job_categories_job_id_jobs_id_fk";
--> statement-breakpoint
ALTER TABLE "job_categories" DROP CONSTRAINT "job_categories_industry_id_industries_id_fk";
--> statement-breakpoint
ALTER TABLE "employers" ALTER COLUMN "budget" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "job_categories" ADD COLUMN "label" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "job_category_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_job_category_id_job_categories_id_fk" FOREIGN KEY ("job_category_id") REFERENCES "public"."job_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "job_categories" DROP COLUMN IF EXISTS "job_id";--> statement-breakpoint
ALTER TABLE "job_categories" DROP COLUMN IF EXISTS "industry_id";