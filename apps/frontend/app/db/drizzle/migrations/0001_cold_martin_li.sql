DO $$ BEGIN
 CREATE TYPE "public"."employer_account_type" AS ENUM('personal', 'company');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "employers" ADD COLUMN "employerAccountType" "employer_account_type";