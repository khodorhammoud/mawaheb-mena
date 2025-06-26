CREATE TYPE "public"."video_attachment_type" AS ENUM('link', 'attachment');--> statement-breakpoint
ALTER TABLE "freelancers" ADD COLUMN "video_attachment_id" integer;--> statement-breakpoint
ALTER TABLE "freelancers" ADD COLUMN "video_type" "video_attachment_type";--> statement-breakpoint
ALTER TABLE "freelancers" ADD CONSTRAINT "freelancers_video_attachment_id_attachments_id_fk" FOREIGN KEY ("video_attachment_id") REFERENCES "public"."attachments"("id") ON DELETE no action ON UPDATE no action;