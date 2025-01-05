CREATE TABLE IF NOT EXISTS "timesheet_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"freelancer_id" integer,
	"job_application_id" integer,
	"date" date,
	"start_time" timestamp,
	"end_time" timestamp,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timesheet_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"freelancer_id" integer,
	"job_application_id" integer,
	"submission_date" date NOT NULL,
	"total_hours" numeric NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timesheet_entries" ADD CONSTRAINT "timesheet_entries_freelancer_id_freelancers_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."freelancers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timesheet_entries" ADD CONSTRAINT "timesheet_entries_job_application_id_job_applications_id_fk" FOREIGN KEY ("job_application_id") REFERENCES "public"."job_applications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timesheet_submissions" ADD CONSTRAINT "timesheet_submissions_freelancer_id_freelancers_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."freelancers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timesheet_submissions" ADD CONSTRAINT "timesheet_submissions_job_application_id_job_applications_id_fk" FOREIGN KEY ("job_application_id") REFERENCES "public"."job_applications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "freelancers" DROP COLUMN IF EXISTS "available_for_work";--> statement-breakpoint
ALTER TABLE "freelancers" DROP COLUMN IF EXISTS "jobs_open_to";