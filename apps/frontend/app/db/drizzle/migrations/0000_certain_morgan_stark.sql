DO $$ BEGIN
 CREATE TYPE "public"."account_status" AS ENUM('draft', 'pending', 'published', 'closed', 'suspended');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."account_type" AS ENUM('freelancer', 'employer');
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
 CREATE TYPE "public"."language" AS ENUM('Spanish', 'English', 'Italian', 'Arabic', 'French', 'Turkish', 'German', 'Portuguese', 'Russian');
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
	"is_creation_complete" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employers" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer,
	"employerAccountType" "eployer_account_type",
	"company_name" varchar(100),
	"employer_name" varchar(100),
	"company_email" varchar(150),
	"industry_sector" text,
	"company_rep_name" varchar(100),
	"company_rep_email" varchar(150),
	"company_rep_position" varchar(60),
	"company_rep_phone" varchar(30),
	"tax_id_number" varchar,
	"tax_id_document_link" text,
	"business_license_link" text,
	"certification_of_incorporation_link" text,
	"website_url" text,
	"social_media_links" jsonb DEFAULT '{}'::jsonb
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
	"language" language[] DEFAULT ARRAY[]::language[],
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
 ALTER TABLE "employers" ADD CONSTRAINT "employers_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
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
