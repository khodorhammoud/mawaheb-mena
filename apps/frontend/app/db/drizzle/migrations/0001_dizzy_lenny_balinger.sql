CREATE TABLE IF NOT EXISTS "timesheet_submission_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"timesheet_submission_id" integer,
	"timesheet_entry_id" integer
);
--> statement-breakpoint
ALTER TABLE "timesheet_submissions" ALTER COLUMN "status" SET DEFAULT 'submitted';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timesheet_submission_entries" ADD CONSTRAINT "timesheet_submission_entries_timesheet_submission_id_timesheet_submissions_id_fk" FOREIGN KEY ("timesheet_submission_id") REFERENCES "public"."timesheet_submissions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timesheet_submission_entries" ADD CONSTRAINT "timesheet_submission_entries_timesheet_entry_id_timesheet_entries_id_fk" FOREIGN KEY ("timesheet_entry_id") REFERENCES "public"."timesheet_entries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
