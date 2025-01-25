
--> statement-breakpoint
DO $$ BEGIN 
ALTER TABLE "users" ADD COLUMN "provider" "provider" DEFAULT 'credentials';

EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
