DO $$ BEGIN
 CREATE TYPE "public"."account_status" AS ENUM('draft', 'pending', 'published', 'closed', 'suspended');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."account_type" AS ENUM('freelancer', 'employer', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."belongs_to" AS ENUM('portfolio', 'certificate');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."compensation_type" AS ENUM('project-based-rate', 'hourly-rate');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."country" AS ENUM('Albania', 'Algeria', 'Bahrain', 'Egypt', 'Iran', 'Iraq', 'Jordan', 'Kuwait', 'Lebanon', 'Libya', 'Morocco', 'Oman', 'Palestine', 'Qatar', 'Saudi_Arabia', 'Syria', 'Tunisia', 'Turkey', 'United_Arab_Emirates', 'Yemen');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."day_of_week" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."eployer_account_type" AS ENUM('personal', 'company');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."experience_level" AS ENUM('entry_level', 'mid_level', 'senior_level');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."job_application_status" AS ENUM('pending', 'shortlisted', 'approved', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."job_status" AS ENUM('draft', 'active', 'closed', 'completed', 'paused', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."jobs_open_to" AS ENUM('full-time-roles', 'part-time-roles', 'employee-roles');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."language" AS ENUM('Spanish', 'English', 'Italian', 'Arabic', 'French', 'Turkish', 'German', 'Portuguese', 'Russian');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."location_preference_type" AS ENUM('remote', 'onsite', 'mixed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."project_type" AS ENUM('short-term', 'long-term', 'per-project-basis');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."provider" AS ENUM('credentials', 'social_account');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."timesheet_status" AS ENUM('draft', 'submitted', 'approved', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timesheet_submission_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"timesheet_submission_id" integer,
	"timesheet_entry_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(80),
	"last_name" varchar(80),
	"email" varchar(150) NOT NULL,
	"password_hash" varchar,
	"is_verified" boolean DEFAULT false,
	"is_onboarded" boolean DEFAULT false,
	"provider" "provider",
	"role" "user_role" DEFAULT 'user',
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer,
	"language_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"slug" varchar(60),
	"account_type" "account_type",
	"country" varchar(100),
	"address" varchar(150),
	"region" varchar(100),
	"account_status" "account_status",
	"phone" varchar(30),
	"website_url" text,
	"social_media_links" jsonb DEFAULT '{}'::jsonb,
	"is_creation_complete" boolean DEFAULT false,
	CONSTRAINT "accounts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employer_industries" (
	"id" serial PRIMARY KEY NOT NULL,
	"employer_id" integer,
	"industry_id" integer,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employers" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer,
	"budget" integer,
	"employerAccountType" "eployer_account_type",
	"company_name" varchar(100),
	"employer_name" varchar(100),
	"company_email" varchar(150),
	"about" text,
	"industry_sector" text,
	"years_in_business" integer,
	"company_rep_name" varchar(100),
	"company_rep_email" varchar(150),
	"company_rep_position" varchar(60),
	"company_rep_phone" varchar(30),
	"tax_id_number" varchar,
	"tax_id_document_link" text,
	"business_license_link" text,
	"certification_of_incorporation_link" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "freelancer_languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"freelancer_id" integer,
	"language_id" integer,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "freelancer_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"freelancer_id" integer,
	"skill_id" integer,
	"years_of_experience" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "freelancers" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer,
	"about" text,
	"fields_of_expertise" text[] DEFAULT '{}'::text[],
	"portfolio" jsonb DEFAULT '[]'::jsonb,
	"work_history" jsonb DEFAULT '[]'::jsonb,
	"cv_link" text,
	"video_link" text,
	"certificates" jsonb DEFAULT '[]'::jsonb,
	"educations" jsonb DEFAULT '[]'::jsonb,
	"years_of_experience" integer,
	"preferred_project_types" project_type[] DEFAULT ARRAY[]::project_type[],
	"hourly_rate" integer,
	"compensation_type" "compensation_type",
	"available_for_work" boolean DEFAULT false,
	"available_from" date,
	"jobs_open_to" jobs_open_to[] DEFAULT ARRAY[]::jobs_open_to[],
	"hours_available_from" time,
	"hours_available_to" time
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "industries" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text,
	"metadata" text[],
	CONSTRAINT "industries_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"freelancer_id" integer,
	"status" "job_application_status",
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"skill_id" integer,
	"is_starred" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"employer_id" integer,
	"title" text,
	"description" text,
	"job_category_id" integer,
	"working_hours_per_week" integer,
	"location_preference" text,
	"project_type" "project_type",
	"budget" integer,
	"experience_level" "experience_level",
	"status" text,
	"created_at" timestamp DEFAULT now(),
	"fulfilled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"language" varchar(25)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preferred_working_times" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer,
	"day" "day_of_week",
	"start_time" time,
	"end_time" time
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"employer_id" integer,
	"freelancer_id" integer,
	"rating" real NOT NULL,
	"comment" text DEFAULT null,
	"created_at" timestamp DEFAULT now(),
	"review_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text,
	"meta_data" text DEFAULT '[]',
	"is_hot" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"provider" varchar(50),
	"provider_account_id" varchar(255),
	"profile_url" varchar(255),
	"access_token" varchar(500),
	"refresh_token" varchar(500),
	"expires_at" timestamp
);
--> statement-breakpoint
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
	"status" "timesheet_status" DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_identifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"attachments" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"token" varchar(256),
	"expiry" timestamp,
	"is_used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_languages" ADD CONSTRAINT "account_languages_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_languages" ADD CONSTRAINT "account_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employer_industries" ADD CONSTRAINT "employer_industries_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employer_industries" ADD CONSTRAINT "employer_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employers" ADD CONSTRAINT "employers_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "freelancer_languages" ADD CONSTRAINT "freelancer_languages_freelancer_id_freelancers_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."freelancers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "freelancer_languages" ADD CONSTRAINT "freelancer_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "freelancers" ADD CONSTRAINT "freelancers_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_freelancer_id_freelancers_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."freelancers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_job_category_id_job_categories_id_fk" FOREIGN KEY ("job_category_id") REFERENCES "public"."job_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "preferred_working_times" ADD CONSTRAINT "preferred_working_times_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_freelancer_id_freelancers_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."freelancers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
DO $$ BEGIN
 ALTER TABLE "user_identifications" ADD CONSTRAINT "user_identifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_verifications" ADD CONSTRAINT "user_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
