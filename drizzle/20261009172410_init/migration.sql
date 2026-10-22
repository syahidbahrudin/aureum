CREATE TYPE "assignment_role" AS ENUM('writer', 'editor', 'reviewer');--> statement-breakpoint
CREATE TYPE "claim_kind" AS ENUM('reported', 'quote', 'inference');--> statement-breakpoint
CREATE TYPE "claim_status" AS ENUM('unchecked', 'supported', 'conflicting', 'unsupported', 'editor_verified');--> statement-breakpoint
CREATE TYPE "correction_kind" AS ENUM('factual', 'development');--> statement-breakpoint
CREATE TYPE "date_certainty" AS ENUM('known', 'approximate', 'unknown');--> statement-breakpoint
CREATE TYPE "distribution_status" AS ENUM('draft', 'scheduled', 'published', 'failed');--> statement-breakpoint
CREATE TYPE "editorial_status" AS ENUM('draft', 'in_review', 'approved', 'scheduled', 'published', 'unpublished');--> statement-breakpoint
CREATE TYPE "entity_category" AS ENUM('person', 'organization', 'place', 'event', 'book', 'political_party');--> statement-breakpoint
CREATE TYPE "lead_status" AS ENUM('new', 'accepted', 'dismissed', 'converted');--> statement-breakpoint
CREATE TYPE "link_status" AS ENUM('suggested', 'accepted', 'removed');--> statement-breakpoint
CREATE TYPE "media_origin" AS ENUM('external', 'upload', 'ai');--> statement-breakpoint
CREATE TYPE "processing_status" AS ENUM('pending', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "role" AS ENUM('admin', 'editor', 'reviewer');--> statement-breakpoint
CREATE TYPE "run_status" AS ENUM('running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "source_status" AS ENUM('active', 'paused', 'inactive');--> statement-breakpoint
CREATE TYPE "source_type" AS ENUM('rss', 'website', 'api');--> statement-breakpoint
CREATE TABLE "archive" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "archive_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ingest_id" integer NOT NULL,
	"source_key" text,
	"url" text NOT NULL,
	"canonical_url" text,
	"language" varchar(32),
	"processing_status" "processing_status" DEFAULT 'pending'::"processing_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "archive_ingest_url" UNIQUE("ingest_id","url")
);
--> statement-breakpoint
CREATE TABLE "article_topics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "article_topics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"archive_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	"status" "link_status" DEFAULT 'suggested'::"link_status" NOT NULL,
	"model" varchar(255),
	"prompt_version" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "article_topic" UNIQUE("archive_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "assignments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"role" "assignment_role" NOT NULL,
	"deadline" timestamp with time zone,
	"story_lead_id" integer,
	"topic_id" integer,
	"editorial_article_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assignment_target" CHECK ("story_lead_id" is not null or "topic_id" is not null or "editorial_article_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"actor_id" integer,
	"action" varchar(64) NOT NULL,
	"target_type" varchar(64) NOT NULL,
	"target_id" integer NOT NULL,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_evidence" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "claim_evidence_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"claim_id" integer NOT NULL,
	"source_revision_id" integer NOT NULL,
	"excerpt" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "claim_evidence_source" UNIQUE("claim_id","source_revision_id")
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "claims_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"editorial_revision_id" integer NOT NULL,
	"text" text NOT NULL,
	"kind" "claim_kind" NOT NULL,
	"status" "claim_status" DEFAULT 'unchecked'::"claim_status" NOT NULL,
	"model" varchar(255),
	"prompt_version" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "correction_claims" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "correction_claims_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"correction_id" integer NOT NULL,
	"claim_id" integer NOT NULL,
	CONSTRAINT "correction_claim" UNIQUE("correction_id","claim_id")
);
--> statement-breakpoint
CREATE TABLE "correction_distribution" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "correction_distribution_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"correction_id" integer NOT NULL,
	"distribution_item_id" integer NOT NULL,
	CONSTRAINT "correction_distribution_item" UNIQUE("correction_id","distribution_item_id")
);
--> statement-breakpoint
CREATE TABLE "corrections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "corrections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"editorial_article_id" integer NOT NULL,
	"before_revision_id" integer NOT NULL,
	"after_revision_id" integer NOT NULL,
	"reason" text NOT NULL,
	"kind" "correction_kind" NOT NULL,
	"public_note" text,
	"source_revision_id" integer,
	"editor_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distribution_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "distribution_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"editorial_article_id" integer NOT NULL,
	"editorial_revision_id" integer NOT NULL,
	"channel" varchar(64) NOT NULL,
	"body" text NOT NULL,
	"status" "distribution_status" DEFAULT 'draft'::"distribution_status" NOT NULL,
	"scheduled_at" timestamp with time zone,
	"external_id" text,
	"result" text,
	"attempt" integer DEFAULT 1 NOT NULL,
	"model" varchar(255),
	"prompt_version" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "distribution_attempt" UNIQUE("editorial_article_id","channel","attempt")
);
--> statement-breakpoint
CREATE TABLE "editorial_articles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "editorial_articles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(255) NOT NULL UNIQUE,
	"status" "editorial_status" DEFAULT 'draft'::"editorial_status" NOT NULL,
	"language" varchar(32),
	"format" varchar(64),
	"needs_review" boolean DEFAULT false NOT NULL,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "editorial_revisions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "editorial_revisions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"editorial_article_id" integer NOT NULL,
	"title" text NOT NULL,
	"standfirst" text,
	"body" text NOT NULL,
	"cover_asset_id" integer,
	"caption" text,
	"credit" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"editor_id" integer,
	"approved_at" timestamp with time zone,
	"approved_by" integer,
	"is_current" boolean DEFAULT true NOT NULL,
	"model" varchar(255),
	"prompt_version" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editorial_sources" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "editorial_sources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"editorial_revision_id" integer NOT NULL,
	"source_revision_id" integer NOT NULL,
	"excerpt" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "editorial_source" UNIQUE("editorial_revision_id","source_revision_id")
);
--> statement-breakpoint
CREATE TABLE "embeddings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "embeddings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source_revision_id" integer NOT NULL,
	"chunk_key" text NOT NULL,
	"model" varchar(255) NOT NULL,
	"dimensions" integer NOT NULL,
	"prompt_version" varchar(64),
	"status" "processing_status" DEFAULT 'pending'::"processing_status" NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "embedding_chunk" UNIQUE("source_revision_id","chunk_key","model")
);
--> statement-breakpoint
CREATE TABLE "entity_aliases" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "entity_aliases_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"entity_id" integer NOT NULL,
	"alias" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entity_alias" UNIQUE("entity_id","alias")
);
--> statement-breakpoint
CREATE TABLE "entity_mentions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "entity_mentions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"entity_id" integer,
	"source_revision_id" integer NOT NULL,
	"suggested_name" varchar(255),
	"excerpt" text NOT NULL,
	"confidence" numeric(4,3),
	"status" "link_status" DEFAULT 'suggested'::"link_status" NOT NULL,
	"model" varchar(255),
	"prompt_version" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "entity_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"category" "entity_category" NOT NULL,
	"description" text,
	"primary_image_asset_id" integer,
	"image_confirmed" boolean DEFAULT false NOT NULL,
	"merged_into_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "event_entities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "event_entities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" integer NOT NULL,
	"entity_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_entity" UNIQUE("event_id","entity_id")
);
--> statement-breakpoint
CREATE TABLE "event_sources" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "event_sources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" integer NOT NULL,
	"source_revision_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_source" UNIQUE("event_id","source_revision_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"topic_id" integer NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"event_date" timestamp with time zone,
	"date_certainty" "date_certainty" DEFAULT 'unknown'::"date_certainty" NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingest_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ingest_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ingest_id" integer NOT NULL,
	"status" "run_status" DEFAULT 'running'::"run_status" NOT NULL,
	"new_count" integer DEFAULT 0 NOT NULL,
	"revised_count" integer DEFAULT 0 NOT NULL,
	"duplicate_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"error" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ingest" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ingest_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"publisher_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"type" "source_type" NOT NULL,
	"language" varchar(32),
	"status" "source_status" DEFAULT 'active'::"source_status" NOT NULL,
	"interval" integer DEFAULT 3600 NOT NULL,
	"auth_secret" text,
	"headers" jsonb DEFAULT '{}' NOT NULL,
	"pagination" jsonb,
	"field_mapping" jsonb,
	"extraction_rules" jsonb,
	"last_run_at" timestamp with time zone,
	"next_run_at" timestamp with time zone,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "media_assets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"filename" text NOT NULL,
	"mime_type" varchar(127) NOT NULL,
	"width" integer,
	"height" integer,
	"origin" "media_origin" NOT NULL,
	"storage_key" text,
	"source_url" text,
	"credit" text,
	"alt_text" text,
	"prompt" text,
	"model" varchar(255),
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "media_crops" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "media_crops_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"asset_id" integer NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"purpose" varchar(64) NOT NULL,
	"storage_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_usages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "media_usages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"asset_id" integer NOT NULL,
	"editorial_article_id" integer,
	"entity_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_usage_target" CHECK ("editorial_article_id" is not null or "entity_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "model_usage" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "model_usage_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"model" varchar(255) NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cost" numeric(12,6),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publishers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "publishers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "setting_editorial" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "setting_editorial_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"language" varchar(32) NOT NULL,
	"timezone" varchar(64) NOT NULL,
	"writing_style" text NOT NULL,
	"writing_tone" text NOT NULL,
	"writing_format" text NOT NULL,
	"writing_structure" text NOT NULL,
	"writing_length" integer NOT NULL,
	"writing_word_count" integer NOT NULL,
	"writing_character_count" integer NOT NULL,
	"writing_paragraph_count" integer NOT NULL,
	"ai_use_label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "setting_model" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "setting_model_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openai_secret" text,
	"anthropic_secret" text,
	"gemini_secret" text,
	"local_secret" text,
	"local_endpoint" text,
	"embedding_model" varchar(255) NOT NULL,
	"extraction_model" varchar(255) NOT NULL,
	"writing_model" varchar(255) NOT NULL,
	"image_model" varchar(255) NOT NULL,
	"usage_limit" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_revisions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "source_revisions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"archive_id" integer NOT NULL,
	"title" text,
	"author" text,
	"original_text" text,
	"cleaned_text" text,
	"category" varchar(255),
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"image_urls" text[] DEFAULT '{}'::text[] NOT NULL,
	"published_at" timestamp with time zone,
	"source_updated_at" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"content_hash" text,
	"is_current" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_lead_entities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "story_lead_entities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"story_lead_id" integer NOT NULL,
	"entity_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "story_lead_entity" UNIQUE("story_lead_id","entity_id")
);
--> statement-breakpoint
CREATE TABLE "story_lead_sources" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "story_lead_sources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"story_lead_id" integer NOT NULL,
	"source_revision_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "story_lead_source" UNIQUE("story_lead_id","source_revision_id")
);
--> statement-breakpoint
CREATE TABLE "story_lead_topics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "story_lead_topics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"story_lead_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "story_lead_topic" UNIQUE("story_lead_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "story_leads" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "story_leads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"angle" text,
	"reason" text,
	"status" "lead_status" DEFAULT 'new'::"lead_status" NOT NULL,
	"assignee_id" integer,
	"editorial_article_id" integer,
	"model" varchar(255),
	"prompt_version" varchar(64),
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "topic_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" text,
	"image_asset_id" integer,
	"parent_id" integer,
	"merged_into_id" integer,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'reviewer'::"role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "archive_ingest_source_key" ON "archive" ("ingest_id","source_key") WHERE "source_key" is not null;--> statement-breakpoint
CREATE INDEX "archive_source" ON "archive" ("ingest_id");--> statement-breakpoint
CREATE INDEX "audit_target" ON "audit_log" ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "claim_revision" ON "claims" ("editorial_revision_id");--> statement-breakpoint
CREATE INDEX "editorial_revision_article" ON "editorial_revisions" ("editorial_article_id");--> statement-breakpoint
CREATE UNIQUE INDEX "editorial_revision_current" ON "editorial_revisions" ("editorial_article_id") WHERE "is_current" = true;--> statement-breakpoint
CREATE INDEX "entity_mention_revision" ON "entity_mentions" ("source_revision_id");--> statement-breakpoint
CREATE INDEX "event_topic" ON "events" ("topic_id","position");--> statement-breakpoint
CREATE INDEX "ingest_history_source" ON "ingest_history" ("ingest_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ingest_url_active" ON "ingest" ("url") WHERE "deleted_at" is null;--> statement-breakpoint
CREATE INDEX "ingest_due" ON "ingest" ("next_run_at") WHERE "status" = 'active';--> statement-breakpoint
CREATE UNIQUE INDEX "media_usage_article" ON "media_usages" ("asset_id","editorial_article_id") WHERE "editorial_article_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "media_usage_entity" ON "media_usages" ("asset_id","entity_id") WHERE "entity_id" is not null;--> statement-breakpoint
CREATE INDEX "source_revision_article" ON "source_revisions" ("archive_id");--> statement-breakpoint
CREATE UNIQUE INDEX "source_revision_current" ON "source_revisions" ("archive_id") WHERE "is_current" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "source_revision_hash" ON "source_revisions" ("archive_id","content_hash") WHERE "content_hash" is not null;--> statement-breakpoint
ALTER TABLE "archive" ADD CONSTRAINT "archive_ingest_id_ingest_id_fkey" FOREIGN KEY ("ingest_id") REFERENCES "ingest"("id");--> statement-breakpoint
ALTER TABLE "article_topics" ADD CONSTRAINT "article_topics_archive_id_archive_id_fkey" FOREIGN KEY ("archive_id") REFERENCES "archive"("id");--> statement-breakpoint
ALTER TABLE "article_topics" ADD CONSTRAINT "article_topics_topic_id_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id");--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_story_lead_id_story_leads_id_fkey" FOREIGN KEY ("story_lead_id") REFERENCES "story_leads"("id");--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_topic_id_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id");--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_editorial_article_id_editorial_articles_id_fkey" FOREIGN KEY ("editorial_article_id") REFERENCES "editorial_articles"("id");--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_claim_id_claims_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claims"("id");--> statement-breakpoint
ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_source_revision_id_source_revisions_id_fkey" FOREIGN KEY ("source_revision_id") REFERENCES "source_revisions"("id");--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_editorial_revision_id_editorial_revisions_id_fkey" FOREIGN KEY ("editorial_revision_id") REFERENCES "editorial_revisions"("id");--> statement-breakpoint
ALTER TABLE "correction_claims" ADD CONSTRAINT "correction_claims_correction_id_corrections_id_fkey" FOREIGN KEY ("correction_id") REFERENCES "corrections"("id");--> statement-breakpoint
ALTER TABLE "correction_claims" ADD CONSTRAINT "correction_claims_claim_id_claims_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claims"("id");--> statement-breakpoint
ALTER TABLE "correction_distribution" ADD CONSTRAINT "correction_distribution_correction_id_corrections_id_fkey" FOREIGN KEY ("correction_id") REFERENCES "corrections"("id");--> statement-breakpoint
ALTER TABLE "correction_distribution" ADD CONSTRAINT "correction_distribution_JucESHw4qQZ8_fkey" FOREIGN KEY ("distribution_item_id") REFERENCES "distribution_items"("id");--> statement-breakpoint
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_editorial_article_id_editorial_articles_id_fkey" FOREIGN KEY ("editorial_article_id") REFERENCES "editorial_articles"("id");--> statement-breakpoint
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_before_revision_id_editorial_revisions_id_fkey" FOREIGN KEY ("before_revision_id") REFERENCES "editorial_revisions"("id");--> statement-breakpoint
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_after_revision_id_editorial_revisions_id_fkey" FOREIGN KEY ("after_revision_id") REFERENCES "editorial_revisions"("id");--> statement-breakpoint
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_source_revision_id_source_revisions_id_fkey" FOREIGN KEY ("source_revision_id") REFERENCES "source_revisions"("id");--> statement-breakpoint
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_editor_id_users_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "distribution_items" ADD CONSTRAINT "distribution_items_QHFKTqGoaabe_fkey" FOREIGN KEY ("editorial_article_id") REFERENCES "editorial_articles"("id");--> statement-breakpoint
ALTER TABLE "distribution_items" ADD CONSTRAINT "distribution_items_Ad7beZmPyYtQ_fkey" FOREIGN KEY ("editorial_revision_id") REFERENCES "editorial_revisions"("id");--> statement-breakpoint
ALTER TABLE "editorial_articles" ADD CONSTRAINT "editorial_articles_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "editorial_revisions" ADD CONSTRAINT "editorial_revisions_xh3mwreCvgOt_fkey" FOREIGN KEY ("editorial_article_id") REFERENCES "editorial_articles"("id");--> statement-breakpoint
ALTER TABLE "editorial_revisions" ADD CONSTRAINT "editorial_revisions_cover_asset_id_media_assets_id_fkey" FOREIGN KEY ("cover_asset_id") REFERENCES "media_assets"("id");--> statement-breakpoint
ALTER TABLE "editorial_revisions" ADD CONSTRAINT "editorial_revisions_editor_id_users_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "editorial_revisions" ADD CONSTRAINT "editorial_revisions_approved_by_users_id_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "editorial_sources" ADD CONSTRAINT "editorial_sources_silx5zFE0f3H_fkey" FOREIGN KEY ("editorial_revision_id") REFERENCES "editorial_revisions"("id");--> statement-breakpoint
ALTER TABLE "editorial_sources" ADD CONSTRAINT "editorial_sources_source_revision_id_source_revisions_id_fkey" FOREIGN KEY ("source_revision_id") REFERENCES "source_revisions"("id");--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_source_revision_id_source_revisions_id_fkey" FOREIGN KEY ("source_revision_id") REFERENCES "source_revisions"("id");--> statement-breakpoint
ALTER TABLE "entity_aliases" ADD CONSTRAINT "entity_aliases_entity_id_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id");--> statement-breakpoint
ALTER TABLE "entity_mentions" ADD CONSTRAINT "entity_mentions_entity_id_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id");--> statement-breakpoint
ALTER TABLE "entity_mentions" ADD CONSTRAINT "entity_mentions_source_revision_id_source_revisions_id_fkey" FOREIGN KEY ("source_revision_id") REFERENCES "source_revisions"("id");--> statement-breakpoint
ALTER TABLE "entity" ADD CONSTRAINT "entity_primary_image_asset_id_media_assets_id_fkey" FOREIGN KEY ("primary_image_asset_id") REFERENCES "media_assets"("id");--> statement-breakpoint
ALTER TABLE "entity" ADD CONSTRAINT "entity_merged_into_id_entity_id_fkey" FOREIGN KEY ("merged_into_id") REFERENCES "entity"("id");--> statement-breakpoint
ALTER TABLE "event_entities" ADD CONSTRAINT "event_entities_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id");--> statement-breakpoint
ALTER TABLE "event_entities" ADD CONSTRAINT "event_entities_entity_id_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id");--> statement-breakpoint
ALTER TABLE "event_sources" ADD CONSTRAINT "event_sources_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id");--> statement-breakpoint
ALTER TABLE "event_sources" ADD CONSTRAINT "event_sources_source_revision_id_source_revisions_id_fkey" FOREIGN KEY ("source_revision_id") REFERENCES "source_revisions"("id");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_topic_id_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id");--> statement-breakpoint
ALTER TABLE "ingest_history" ADD CONSTRAINT "ingest_history_ingest_id_ingest_id_fkey" FOREIGN KEY ("ingest_id") REFERENCES "ingest"("id");--> statement-breakpoint
ALTER TABLE "ingest" ADD CONSTRAINT "ingest_publisher_id_publishers_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "publishers"("id");--> statement-breakpoint
ALTER TABLE "ingest" ADD CONSTRAINT "ingest_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "media_crops" ADD CONSTRAINT "media_crops_asset_id_media_assets_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "media_assets"("id");--> statement-breakpoint
ALTER TABLE "media_usages" ADD CONSTRAINT "media_usages_asset_id_media_assets_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "media_assets"("id");--> statement-breakpoint
ALTER TABLE "media_usages" ADD CONSTRAINT "media_usages_editorial_article_id_editorial_articles_id_fkey" FOREIGN KEY ("editorial_article_id") REFERENCES "editorial_articles"("id");--> statement-breakpoint
ALTER TABLE "media_usages" ADD CONSTRAINT "media_usages_entity_id_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id");--> statement-breakpoint
ALTER TABLE "source_revisions" ADD CONSTRAINT "source_revisions_archive_id_archive_id_fkey" FOREIGN KEY ("archive_id") REFERENCES "archive"("id");--> statement-breakpoint
ALTER TABLE "story_lead_entities" ADD CONSTRAINT "story_lead_entities_story_lead_id_story_leads_id_fkey" FOREIGN KEY ("story_lead_id") REFERENCES "story_leads"("id");--> statement-breakpoint
ALTER TABLE "story_lead_entities" ADD CONSTRAINT "story_lead_entities_entity_id_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id");--> statement-breakpoint
ALTER TABLE "story_lead_sources" ADD CONSTRAINT "story_lead_sources_story_lead_id_story_leads_id_fkey" FOREIGN KEY ("story_lead_id") REFERENCES "story_leads"("id");--> statement-breakpoint
ALTER TABLE "story_lead_sources" ADD CONSTRAINT "story_lead_sources_source_revision_id_source_revisions_id_fkey" FOREIGN KEY ("source_revision_id") REFERENCES "source_revisions"("id");--> statement-breakpoint
ALTER TABLE "story_lead_topics" ADD CONSTRAINT "story_lead_topics_story_lead_id_story_leads_id_fkey" FOREIGN KEY ("story_lead_id") REFERENCES "story_leads"("id");--> statement-breakpoint
ALTER TABLE "story_lead_topics" ADD CONSTRAINT "story_lead_topics_topic_id_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id");--> statement-breakpoint
ALTER TABLE "story_leads" ADD CONSTRAINT "story_leads_assignee_id_users_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "story_leads" ADD CONSTRAINT "story_leads_editorial_article_id_editorial_articles_id_fkey" FOREIGN KEY ("editorial_article_id") REFERENCES "editorial_articles"("id");--> statement-breakpoint
ALTER TABLE "story_leads" ADD CONSTRAINT "story_leads_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_image_asset_id_media_assets_id_fkey" FOREIGN KEY ("image_asset_id") REFERENCES "media_assets"("id");--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_parent_id_topic_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "topic"("id");--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_merged_into_id_topic_id_fkey" FOREIGN KEY ("merged_into_id") REFERENCES "topic"("id");