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
	"firstName" varchar(80),
	"lastName" varchar(80),
	"email" varchar(150) NOT NULL,
	"passHash" varchar NOT NULL,
	"isVerified" boolean DEFAULT false,
	"isOnboarded" boolean DEFAULT false,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"accountId" integer,
	"languageId" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"accountType" "account_type",
	"location" varchar(150),
	"country" "country",
	"region" varchar(100),
	"accountStatus" "account_status",
	"phone" varchar(20)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employers" (
	"id" serial PRIMARY KEY NOT NULL,
	"accountId" integer,
	"employerAccountType" "eployer_account_type",
	"companyName" varchar(100),
	"employerName" varchar(100),
	"companyEmail" varchar(150),
	"industrySector" text,
	"companyRepName" varchar(100),
	"companyRepEmail" varchar(150),
	"companyRepPosition" varchar(60),
	"companyRepPhone" varchar(20),
	"taxIdNumber" varchar,
	"taxIdDocumentLink" text,
	"businessLicenseLink" text,
	"certificationOfIncorporationLink" text,
	"WebsiteURL" text,
	"socialMediaLinks" text[] DEFAULT '{}'::text[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "freelancers" (
	"id" serial PRIMARY KEY NOT NULL,
	"accountId" integer,
	"fieldsOfExpertise" text[] DEFAULT '{}'::text[],
	"portfolio" text[] DEFAULT '{}'::text[],
	"portfolioDescription" text,
	"cvLink" text,
	"videoLink" text,
	"certificatesLinks" text[] DEFAULT '{}'::text[],
	"yearsOfExperience" varchar(80),
	"language" language[] DEFAULT ARRAY[]::language[],
	"preferredProjectTypes" project_type[] DEFAULT ARRAY[]::project_type[],
	"compensationType" "compensation_type"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"language" "language"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preferred_working_times" (
	"id" serial PRIMARY KEY NOT NULL,
	"accountId" integer,
	"day" "day_of_week",
	"startTime" time,
	"endTime" time
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"token" varchar(256),
	"expiry" timestamp,
	"isUsed" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_languages" ADD CONSTRAINT "account_languages_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_languages" ADD CONSTRAINT "account_languages_languageId_languages_id_fk" FOREIGN KEY ("languageId") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employers" ADD CONSTRAINT "employers_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "freelancers" ADD CONSTRAINT "freelancers_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "preferred_working_times" ADD CONSTRAINT "preferred_working_times_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_verification" ADD CONSTRAINT "user_verification_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
