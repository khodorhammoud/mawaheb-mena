ALTER TABLE "freelancers" ADD COLUMN "available_for_work" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "freelancers" ADD COLUMN "jobs_open_to" jobs_open_to[] DEFAULT ARRAY[]::jobs_open_to[];