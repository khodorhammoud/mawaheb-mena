CREATE TABLE IF NOT EXISTS "job_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"skill_id" integer,
	"is_starred" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"meta_data" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "required_skills" SET DATA TYPE json[];--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "required_skills" SET DEFAULT '[]'::jsonb[];--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "required_skills" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
