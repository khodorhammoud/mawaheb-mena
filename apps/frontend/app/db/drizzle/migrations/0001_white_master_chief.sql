CREATE TABLE IF NOT EXISTS "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"bucket" varchar NOT NULL,
	"url" varchar NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"belongs_to" "belongs_to" NOT NULL,
	"component_id" integer NOT NULL,
	"field_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
