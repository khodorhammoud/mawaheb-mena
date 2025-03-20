-- Add unique constraint to user_id in user_identifications table
ALTER TABLE "user_identifications" ADD CONSTRAINT "user_identifications_user_id_unique" UNIQUE ("user_id"); 