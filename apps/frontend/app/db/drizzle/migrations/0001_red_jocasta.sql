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
	"timesheet_entries_ids" integer[],
	"day" date,
	"notes" text,
	"status" varchar(50),
	"created_at" timestamp DEFAULT now()
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
