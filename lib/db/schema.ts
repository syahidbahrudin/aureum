import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import {
  assignmentRole,
  claimKind,
  claimStatus,
  correctionKind,
  dateCertainty,
  distributionStatus,
  editorialStatus,
  leadStatus,
  linkStatus,
  mediaOrigin,
  processingStatus,
  role,
  runStatus,
  sourceStatus,
  sourceType,
} from "./enum";

export {
  assignmentRole,
  claimKind,
  claimStatus,
  correctionKind,
  dateCertainty,
  distributionStatus,
  editorialStatus,
  leadStatus,
  linkStatus,
  mediaOrigin,
  processingStatus,
  role,
  runStatus,
  sourceStatus,
  sourceType,
} from "./enum";

const id = () => integer("id").primaryKey().generatedAlwaysAsIdentity();
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();
const deletedAt = () => timestamp("deleted_at", { withTimezone: true });

export const usersTable = pgTable("users", {
  id: id(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: role("role").notNull().default("reviewer"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const publishersTable = pgTable("publishers", {
  id: id(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const ingestTable = pgTable(
  "ingest",
  {
    id: id(),
    publisherId: integer("publisher_id")
      .notNull()
      .references(() => publishersTable.id),
    name: varchar("name", { length: 255 }).notNull(),
    url: text("url").notNull(),
    type: sourceType("type").notNull(),
    language: varchar("language", { length: 32 }),
    status: sourceStatus("status").notNull().default("active"),
    interval: integer("interval").notNull().default(3600),
    authSecret: text("auth_secret"),
    headers: jsonb("headers")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    pagination: jsonb("pagination").$type<Record<string, unknown>>(),
    fieldMapping: jsonb("field_mapping").$type<Record<string, string>>(),
    extractionRules: jsonb("extraction_rules").$type<Record<string, unknown>>(),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    nextRunAt: timestamp("next_run_at", { withTimezone: true }),
    createdBy: integer("created_by").references(() => usersTable.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("ingest_url_active")
      .on(t.url)
      .where(sql`${t.deletedAt} is null`),
    index("ingest_due")
      .on(t.nextRunAt)
      .where(sql`${t.status} = 'active'`),
  ],
);

export const ingestHistoryTable = pgTable(
  "ingest_history",
  {
    id: id(),
    ingestId: integer("ingest_id")
      .notNull()
      .references(() => ingestTable.id),
    status: runStatus("status").notNull().default("running"),
    newCount: integer("new_count").notNull().default(0),
    revisedCount: integer("revised_count").notNull().default(0),
    duplicateCount: integer("duplicate_count").notNull().default(0),
    failedCount: integer("failed_count").notNull().default(0),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => [index("ingest_history_source").on(t.ingestId)],
);

export const archiveTable = pgTable(
  "archive",
  {
    id: id(),
    ingestId: integer("ingest_id")
      .notNull()
      .references(() => ingestTable.id),
    sourceKey: text("source_key"),
    url: text("url").notNull(),
    canonicalUrl: text("canonical_url"),
    language: varchar("language", { length: 32 }),
    processingStatus: processingStatus("processing_status")
      .notNull()
      .default("pending"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    unique("archive_ingest_url").on(t.ingestId, t.url),
    uniqueIndex("archive_ingest_source_key")
      .on(t.ingestId, t.sourceKey)
      .where(sql`${t.sourceKey} is not null`),
    index("archive_source").on(t.ingestId),
  ],
);

export const sourceRevisionsTable = pgTable(
  "source_revisions",
  {
    id: id(),
    archiveId: integer("archive_id")
      .notNull()
      .references(() => archiveTable.id),
    title: text("title"),
    author: text("author"),
    originalText: text("original_text"),
    cleanedText: text("cleaned_text"),
    category: varchar("category", { length: 255 }),
    tags: text("tags").array().notNull().default([]),
    imageUrls: text("image_urls").array().notNull().default([]),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    sourceUpdatedAt: timestamp("source_updated_at", { withTimezone: true }),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    contentHash: text("content_hash"),
    sentiment: varchar("sentiment", { length: 32 }),
    sentimentScore: numeric("sentiment_score", { precision: 4, scale: 3 }),
    isCurrent: boolean("is_current").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [
    index("source_revision_article").on(t.archiveId),
    uniqueIndex("source_revision_current")
      .on(t.archiveId)
      .where(sql`${t.isCurrent} = true`),
    uniqueIndex("source_revision_hash")
      .on(t.archiveId, t.contentHash)
      .where(sql`${t.contentHash} is not null`),
  ],
);

export const embeddingsTable = pgTable(
  "embeddings",
  {
    id: id(),
    sourceRevisionId: integer("source_revision_id")
      .notNull()
      .references(() => sourceRevisionsTable.id),
    chunkKey: text("chunk_key").notNull(),
    model: varchar("model", { length: 255 }).notNull(),
    dimensions: integer("dimensions").notNull(),
    promptVersion: varchar("prompt_version", { length: 64 }),
    status: processingStatus("status").notNull().default("pending"),
    error: text("error"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique("embedding_chunk").on(t.sourceRevisionId, t.chunkKey, t.model),
  ],
);

export const mediaAssetsTable = pgTable("media_assets", {
  id: id(),
  filename: text("filename").notNull(),
  mimeType: varchar("mime_type", { length: 127 }).notNull(),
  width: integer("width"),
  height: integer("height"),
  origin: mediaOrigin("origin").notNull(),
  storageKey: text("storage_key"),
  sourceUrl: text("source_url"),
  credit: text("credit"),
  altText: text("alt_text"),
  prompt: text("prompt"),
  model: varchar("model", { length: 255 }),
  createdBy: integer("created_by").references(() => usersTable.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const mediaCropsTable = pgTable("media_crops", {
  id: id(),
  assetId: integer("asset_id")
    .notNull()
    .references(() => mediaAssetsTable.id),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  purpose: varchar("purpose", { length: 64 }).notNull(),
  storageKey: text("storage_key"),
  createdAt: createdAt(),
});

export const entityTable = pgTable(
  "entity",
  {
    id: id(),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    description: text("description"),
    primaryImageAssetId: integer("primary_image_asset_id").references(
      () => mediaAssetsTable.id,
    ),
    imageConfirmed: boolean("image_confirmed").notNull().default(false),
    mergedIntoId: integer("merged_into_id").references(
      (): AnyPgColumn => entityTable.id,
    ),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("entity_active_name")
      .on(sql`lower(${t.name})`, t.category)
      .where(sql`${t.deletedAt} is null and ${t.mergedIntoId} is null`),
  ],
);

export const entityAliasesTable = pgTable(
  "entity_aliases",
  {
    id: id(),
    entityId: integer("entity_id")
      .notNull()
      .references(() => entityTable.id),
    alias: varchar("alias", { length: 255 }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [unique("entity_alias").on(t.entityId, t.alias)],
);

export const entityMentionsTable = pgTable(
  "entity_mentions",
  {
    id: id(),
    entityId: integer("entity_id").references(() => entityTable.id),
    sourceRevisionId: integer("source_revision_id")
      .notNull()
      .references(() => sourceRevisionsTable.id),
    suggestedName: varchar("suggested_name", { length: 255 }),
    excerpt: text("excerpt").notNull(),
    confidence: numeric("confidence", { precision: 4, scale: 3 }),
    status: linkStatus("status").notNull().default("suggested"),
    model: varchar("model", { length: 255 }),
    promptVersion: varchar("prompt_version", { length: 64 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("entity_mention_revision").on(t.sourceRevisionId),
    uniqueIndex("entity_mention_name")
      .on(t.sourceRevisionId, sql`lower(${t.suggestedName})`)
      .where(sql`${t.suggestedName} is not null`),
  ],
);

export const topicTable = pgTable(
  "topic",
  {
    id: id(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    imageAssetId: integer("image_asset_id").references(() => mediaAssetsTable.id),
    parentId: integer("parent_id").references((): AnyPgColumn => topicTable.id),
    mergedIntoId: integer("merged_into_id").references(
      (): AnyPgColumn => topicTable.id,
    ),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("topic_active_name")
      .on(sql`lower(${t.name})`)
      .where(
        sql`${t.deletedAt} is null and ${t.mergedIntoId} is null and ${t.archivedAt} is null`,
      ),
  ],
);

export const articleTopicsTable = pgTable(
  "article_topics",
  {
    id: id(),
    archiveId: integer("archive_id")
      .notNull()
      .references(() => archiveTable.id),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topicTable.id),
    status: linkStatus("status").notNull().default("suggested"),
    model: varchar("model", { length: 255 }),
    promptVersion: varchar("prompt_version", { length: 64 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [unique("article_topic").on(t.archiveId, t.topicId)],
);

export const eventsTable = pgTable(
  "events",
  {
    id: id(),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topicTable.id),
    title: text("title").notNull(),
    summary: text("summary"),
    eventDate: timestamp("event_date", { withTimezone: true }),
    dateCertainty: dateCertainty("date_certainty").notNull().default("unknown"),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("event_topic").on(t.topicId, t.position)],
);

export const eventSourcesTable = pgTable(
  "event_sources",
  {
    id: id(),
    eventId: integer("event_id")
      .notNull()
      .references(() => eventsTable.id),
    sourceRevisionId: integer("source_revision_id")
      .notNull()
      .references(() => sourceRevisionsTable.id),
    createdAt: createdAt(),
  },
  (t) => [unique("event_source").on(t.eventId, t.sourceRevisionId)],
);

export const eventEntitiesTable = pgTable(
  "event_entities",
  {
    id: id(),
    eventId: integer("event_id")
      .notNull()
      .references(() => eventsTable.id),
    entityId: integer("entity_id")
      .notNull()
      .references(() => entityTable.id),
    createdAt: createdAt(),
  },
  (t) => [unique("event_entity").on(t.eventId, t.entityId)],
);

export const storyLeadsTable = pgTable("story_leads", {
  id: id(),
  title: text("title").notNull(),
  angle: text("angle"),
  reason: text("reason"),
  status: leadStatus("status").notNull().default("new"),
  assigneeId: integer("assignee_id").references(() => usersTable.id),
  editorialArticleId: integer("editorial_article_id").references(
    (): AnyPgColumn => editorialArticlesTable.id,
  ),
  model: varchar("model", { length: 255 }),
  promptVersion: varchar("prompt_version", { length: 64 }),
  createdBy: integer("created_by").references(() => usersTable.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const storyLeadSourcesTable = pgTable(
  "story_lead_sources",
  {
    id: id(),
    storyLeadId: integer("story_lead_id")
      .notNull()
      .references(() => storyLeadsTable.id),
    sourceRevisionId: integer("source_revision_id")
      .notNull()
      .references(() => sourceRevisionsTable.id),
    createdAt: createdAt(),
  },
  (t) => [unique("story_lead_source").on(t.storyLeadId, t.sourceRevisionId)],
);

export const storyLeadTopicsTable = pgTable(
  "story_lead_topics",
  {
    id: id(),
    storyLeadId: integer("story_lead_id")
      .notNull()
      .references(() => storyLeadsTable.id),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topicTable.id),
    createdAt: createdAt(),
  },
  (t) => [unique("story_lead_topic").on(t.storyLeadId, t.topicId)],
);

export const storyLeadEntitiesTable = pgTable(
  "story_lead_entities",
  {
    id: id(),
    storyLeadId: integer("story_lead_id")
      .notNull()
      .references(() => storyLeadsTable.id),
    entityId: integer("entity_id")
      .notNull()
      .references(() => entityTable.id),
    createdAt: createdAt(),
  },
  (t) => [unique("story_lead_entity").on(t.storyLeadId, t.entityId)],
);

export const editorialArticlesTable = pgTable("editorial_articles", {
  id: id(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  status: editorialStatus("status").notNull().default("draft"),
  language: varchar("language", { length: 32 }),
  format: varchar("format", { length: 64 }),
  needsReview: boolean("needs_review").notNull().default(false),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdBy: integer("created_by").references(() => usersTable.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const editorialRevisionsTable = pgTable(
  "editorial_revisions",
  {
    id: id(),
    editorialArticleId: integer("editorial_article_id")
      .notNull()
      .references(() => editorialArticlesTable.id),
    title: text("title").notNull(),
    standfirst: text("standfirst"),
    body: text("body").notNull(),
    coverAssetId: integer("cover_asset_id").references(
      () => mediaAssetsTable.id,
    ),
    caption: text("caption"),
    credit: text("credit"),
    tags: text("tags").array().notNull().default([]),
    editorId: integer("editor_id").references(() => usersTable.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: integer("approved_by").references(() => usersTable.id),
    isCurrent: boolean("is_current").notNull().default(true),
    model: varchar("model", { length: 255 }),
    promptVersion: varchar("prompt_version", { length: 64 }),
    createdAt: createdAt(),
  },
  (t) => [
    index("editorial_revision_article").on(t.editorialArticleId),
    uniqueIndex("editorial_revision_current")
      .on(t.editorialArticleId)
      .where(sql`${t.isCurrent} = true`),
  ],
);

export const editorialSourcesTable = pgTable(
  "editorial_sources",
  {
    id: id(),
    editorialRevisionId: integer("editorial_revision_id")
      .notNull()
      .references(() => editorialRevisionsTable.id),
    sourceRevisionId: integer("source_revision_id")
      .notNull()
      .references(() => sourceRevisionsTable.id),
    excerpt: text("excerpt").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    unique("editorial_source").on(t.editorialRevisionId, t.sourceRevisionId),
  ],
);

export const claimsTable = pgTable(
  "claims",
  {
    id: id(),
    editorialRevisionId: integer("editorial_revision_id")
      .notNull()
      .references(() => editorialRevisionsTable.id),
    text: text("text").notNull(),
    kind: claimKind("kind").notNull(),
    status: claimStatus("status").notNull().default("unchecked"),
    model: varchar("model", { length: 255 }),
    promptVersion: varchar("prompt_version", { length: 64 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("claim_revision").on(t.editorialRevisionId)],
);

export const claimEvidenceTable = pgTable(
  "claim_evidence",
  {
    id: id(),
    claimId: integer("claim_id")
      .notNull()
      .references(() => claimsTable.id),
    sourceRevisionId: integer("source_revision_id")
      .notNull()
      .references(() => sourceRevisionsTable.id),
    excerpt: text("excerpt").notNull(),
    createdAt: createdAt(),
  },
  (t) => [unique("claim_evidence_source").on(t.claimId, t.sourceRevisionId)],
);

export const mediaUsagesTable = pgTable(
  "media_usages",
  {
    id: id(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => mediaAssetsTable.id),
    editorialArticleId: integer("editorial_article_id").references(
      () => editorialArticlesTable.id,
    ),
    entityId: integer("entity_id").references(() => entityTable.id),
    createdAt: createdAt(),
  },
  (t) => [
    check(
      "media_usage_target",
      sql`${t.editorialArticleId} is not null or ${t.entityId} is not null`,
    ),
    uniqueIndex("media_usage_article")
      .on(t.assetId, t.editorialArticleId)
      .where(sql`${t.editorialArticleId} is not null`),
    uniqueIndex("media_usage_entity")
      .on(t.assetId, t.entityId)
      .where(sql`${t.entityId} is not null`),
  ],
);

export const assignmentsTable = pgTable(
  "assignments",
  {
    id: id(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id),
    role: assignmentRole("role").notNull(),
    deadline: timestamp("deadline", { withTimezone: true }),
    storyLeadId: integer("story_lead_id").references(() => storyLeadsTable.id),
    topicId: integer("topic_id").references(() => topicTable.id),
    editorialArticleId: integer("editorial_article_id").references(
      () => editorialArticlesTable.id,
    ),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check(
      "assignment_target",
      sql`${t.storyLeadId} is not null or ${t.topicId} is not null or ${t.editorialArticleId} is not null`,
    ),
  ],
);

export const distributionItemsTable = pgTable(
  "distribution_items",
  {
    id: id(),
    editorialArticleId: integer("editorial_article_id")
      .notNull()
      .references(() => editorialArticlesTable.id),
    editorialRevisionId: integer("editorial_revision_id")
      .notNull()
      .references(() => editorialRevisionsTable.id),
    channel: varchar("channel", { length: 64 }).notNull(),
    body: text("body").notNull(),
    status: distributionStatus("status").notNull().default("draft"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    externalId: text("external_id"),
    result: text("result"),
    attempt: integer("attempt").notNull().default(1),
    model: varchar("model", { length: 255 }),
    promptVersion: varchar("prompt_version", { length: 64 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    unique("distribution_attempt").on(
      t.editorialArticleId,
      t.channel,
      t.attempt,
    ),
  ],
);

export const correctionsTable = pgTable("corrections", {
  id: id(),
  editorialArticleId: integer("editorial_article_id")
    .notNull()
    .references(() => editorialArticlesTable.id),
  beforeRevisionId: integer("before_revision_id")
    .notNull()
    .references(() => editorialRevisionsTable.id),
  afterRevisionId: integer("after_revision_id")
    .notNull()
    .references(() => editorialRevisionsTable.id),
  reason: text("reason").notNull(),
  kind: correctionKind("kind").notNull(),
  publicNote: text("public_note"),
  sourceRevisionId: integer("source_revision_id").references(
    () => sourceRevisionsTable.id,
  ),
  editorId: integer("editor_id")
    .notNull()
    .references(() => usersTable.id),
  createdAt: createdAt(),
});

export const correctionClaimsTable = pgTable(
  "correction_claims",
  {
    id: id(),
    correctionId: integer("correction_id")
      .notNull()
      .references(() => correctionsTable.id),
    claimId: integer("claim_id")
      .notNull()
      .references(() => claimsTable.id),
  },
  (t) => [unique("correction_claim").on(t.correctionId, t.claimId)],
);

export const correctionDistributionTable = pgTable(
  "correction_distribution",
  {
    id: id(),
    correctionId: integer("correction_id")
      .notNull()
      .references(() => correctionsTable.id),
    distributionItemId: integer("distribution_item_id")
      .notNull()
      .references(() => distributionItemsTable.id),
  },
  (t) => [
    unique("correction_distribution_item").on(
      t.correctionId,
      t.distributionItemId,
    ),
  ],
);

export const auditLogTable = pgTable(
  "audit_log",
  {
    id: id(),
    actorId: integer("actor_id").references(() => usersTable.id),
    action: varchar("action", { length: 64 }).notNull(),
    targetType: varchar("target_type", { length: 64 }).notNull(),
    targetId: integer("target_id").notNull(),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (t) => [index("audit_target").on(t.targetType, t.targetId)],
);

export const settingEditorialTable = pgTable("setting_editorial", {
  id: id(),
  language: varchar("language", { length: 32 }).notNull(),
  timezone: varchar("timezone", { length: 64 }).notNull(),
  writingStyle: text("writing_style").notNull(),
  writingTone: text("writing_tone").notNull(),
  writingFormat: text("writing_format").notNull(),
  writingStructure: text("writing_structure").notNull(),
  writingLength: integer("writing_length").notNull(),
  writingWordCount: integer("writing_word_count").notNull(),
  writingCharacterCount: integer("writing_character_count").notNull(),
  writingParagraphCount: integer("writing_paragraph_count").notNull(),
  aiUseLabel: text("ai_use_label").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const settingModelTable = pgTable("setting_model", {
  id: id(),
  openaiSecret: text("openai_secret"),
  anthropicSecret: text("anthropic_secret"),
  geminiSecret: text("gemini_secret"),
  localSecret: text("local_secret"),
  localEndpoint: text("local_endpoint"),
  embeddingModel: varchar("embedding_model", { length: 255 }).notNull(),
  extractionModel: varchar("extraction_model", { length: 255 }).notNull(),
  writingModel: varchar("writing_model", { length: 255 }).notNull(),
  imageModel: varchar("image_model", { length: 255 }).notNull(),
  usageLimit: integer("usage_limit"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const modelUsageTable = pgTable("model_usage", {
  id: id(),
  model: varchar("model", { length: 255 }).notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  cost: numeric("cost", { precision: 12, scale: 6 }),
  createdAt: createdAt(),
});
