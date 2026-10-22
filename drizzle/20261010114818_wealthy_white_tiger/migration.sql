ALTER TABLE "source_revisions" ADD COLUMN "sentiment" varchar(32);--> statement-breakpoint
ALTER TABLE "source_revisions" ADD COLUMN "sentiment_score" numeric(4,3);