ALTER TABLE "languages" RENAME COLUMN "language" TO "name";--> statement-breakpoint
ALTER TABLE "languages" ALTER COLUMN "name" SET DATA TYPE varchar(25);