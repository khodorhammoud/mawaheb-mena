CREATE TABLE IF NOT EXISTS "freelancer_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"freelancer_id" integer,
	"skill_id" integer,
	"years_of_experience" integer
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "required_skills" json DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "is_hot" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "freelancer_skills" ADD CONSTRAINT "freelancer_skills_freelancer_id_freelancers_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."freelancers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "freelancer_skills" ADD CONSTRAINT "freelancer_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
