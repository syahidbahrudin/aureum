ALTER TABLE "entity" ALTER COLUMN "category" SET DATA TYPE varchar(64) USING "category"::varchar(64);--> statement-breakpoint
DROP TYPE "entity_category";