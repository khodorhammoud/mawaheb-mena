CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(80),
	"last_name" varchar(80),
	"email" varchar(150) NOT NULL,
	"password_hash" varchar NOT NULL,
	"is_verified" boolean DEFAULT false,
	"is_onboarded" boolean DEFAULT false,
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
	"account_type" "account_type",
	"location" varchar(150),
	"country" "country",
	"region" varchar(100),
	"account_status" "account_status",
	"phone" varchar(30),
	"website_url" text,
	"social_media_links" jsonb DEFAULT '{}'::jsonb,
	"is_creation_complete" boolean DEFAULT false
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
CREATE TABLE IF NOT EXISTS "freelancers" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer,
	"fields_of_expertise" text[] DEFAULT '{}'::text[],
	"portfolio" text[] DEFAULT '{}'::text[],
	"portfolio_description" text,
	"cv_link" text,
	"video_link" text,
	"certificates_links" text[] DEFAULT '{}'::text[],
	"years_of_experience" varchar(80),
	"preferred_project_types" project_type[] DEFAULT ARRAY[]::project_type[],
	"compensation_type" "compensation_type"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "industries" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text,
	"metadata" text[],
	CONSTRAINT "industries_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text,
	"timestamp" timestamp DEFAULT now()
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
	"required_skills" text[],
	"project_type" "project_type",
	"budget" integer,
	"experience_level" text,
	"is_active" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false,
	"is_draft" boolean DEFAULT true,
	"is_closed" boolean DEFAULT false,
	"is_paused" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"language" "language"
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
 ALTER TABLE "freelancers" ADD CONSTRAINT "freelancers_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "user_verifications" ADD CONSTRAINT "user_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
