import { relations } from "drizzle-orm/_relations";
import {
  archiveTable,
  articleTopicsTable,
  assignmentsTable,
  auditLogTable,
  claimEvidenceTable,
  claimsTable,
  correctionClaimsTable,
  correctionDistributionTable,
  correctionsTable,
  distributionItemsTable,
  editorialArticlesTable,
  editorialRevisionsTable,
  editorialSourcesTable,
  embeddingsTable,
  entityAliasesTable,
  entityMentionsTable,
  entityTable,
  eventEntitiesTable,
  eventSourcesTable,
  eventsTable,
  ingestHistoryTable,
  ingestTable,
  mediaAssetsTable,
  mediaCropsTable,
  mediaUsagesTable,
  publishersTable,
  sourceRevisionsTable,
  storyLeadEntitiesTable,
  storyLeadSourcesTable,
  storyLeadTopicsTable,
  storyLeadsTable,
  topicTable,
  usersTable,
} from "./schema";

export const userRelations = relations(usersTable, ({ many }) => ({
  sources: many(ingestTable),
  auditEntries: many(auditLogTable),
}));

export const publisherRelations = relations(publishersTable, ({ many }) => ({
  sources: many(ingestTable),
}));

export const ingestRelations = relations(ingestTable, ({ one, many }) => ({
  publisher: one(publishersTable, {
    fields: [ingestTable.publisherId],
    references: [publishersTable.id],
  }),
  createdBy: one(usersTable, {
    fields: [ingestTable.createdBy],
    references: [usersTable.id],
  }),
  articles: many(archiveTable),
  runs: many(ingestHistoryTable),
}));

export const ingestHistoryRelations = relations(ingestHistoryTable, ({ one }) => ({
  ingest: one(ingestTable, {
    fields: [ingestHistoryTable.ingestId],
    references: [ingestTable.id],
  }),
}));

export const archiveRelations = relations(archiveTable, ({ one, many }) => ({
  ingest: one(ingestTable, {
    fields: [archiveTable.ingestId],
    references: [ingestTable.id],
  }),
  revisions: many(sourceRevisionsTable),
  topics: many(articleTopicsTable),
}));

export const sourceRevisionRelations = relations(sourceRevisionsTable, ({ one, many }) => ({
  article: one(archiveTable, {
    fields: [sourceRevisionsTable.archiveId],
    references: [archiveTable.id],
  }),
  embeddings: many(embeddingsTable),
  mentions: many(entityMentionsTable),
  eventSources: many(eventSourcesTable),
  leadSources: many(storyLeadSourcesTable),
  editorialSources: many(editorialSourcesTable),
  evidence: many(claimEvidenceTable),
}));

export const embeddingRelations = relations(embeddingsTable, ({ one }) => ({
  revision: one(sourceRevisionsTable, {
    fields: [embeddingsTable.sourceRevisionId],
    references: [sourceRevisionsTable.id],
  }),
}));

export const mediaAssetRelations = relations(mediaAssetsTable, ({ one, many }) => ({
  createdBy: one(usersTable, {
    fields: [mediaAssetsTable.createdBy],
    references: [usersTable.id],
  }),
  crops: many(mediaCropsTable),
  usages: many(mediaUsagesTable),
}));

export const mediaCropRelations = relations(mediaCropsTable, ({ one }) => ({
  asset: one(mediaAssetsTable, {
    fields: [mediaCropsTable.assetId],
    references: [mediaAssetsTable.id],
  }),
}));

export const entityRelations = relations(entityTable, ({ one, many }) => ({
  primaryImage: one(mediaAssetsTable, {
    fields: [entityTable.primaryImageAssetId],
    references: [mediaAssetsTable.id],
  }),
  mergedInto: one(entityTable, {
    fields: [entityTable.mergedIntoId],
    references: [entityTable.id],
    relationName: "entity_merge",
  }),
  mergedFrom: many(entityTable, { relationName: "entity_merge" }),
  aliases: many(entityAliasesTable),
  mentions: many(entityMentionsTable),
  events: many(eventEntitiesTable),
}));

export const entityAliasRelations = relations(entityAliasesTable, ({ one }) => ({
  entity: one(entityTable, {
    fields: [entityAliasesTable.entityId],
    references: [entityTable.id],
  }),
}));

export const entityMentionRelations = relations(entityMentionsTable, ({ one }) => ({
  entity: one(entityTable, {
    fields: [entityMentionsTable.entityId],
    references: [entityTable.id],
  }),
  revision: one(sourceRevisionsTable, {
    fields: [entityMentionsTable.sourceRevisionId],
    references: [sourceRevisionsTable.id],
  }),
}));

export const topicRelations = relations(topicTable, ({ one, many }) => ({
  image: one(mediaAssetsTable, {
    fields: [topicTable.imageAssetId],
    references: [mediaAssetsTable.id],
  }),
  parent: one(topicTable, {
    fields: [topicTable.parentId],
    references: [topicTable.id],
    relationName: "topic_parent",
  }),
  children: many(topicTable, { relationName: "topic_parent" }),
  mergedInto: one(topicTable, {
    fields: [topicTable.mergedIntoId],
    references: [topicTable.id],
    relationName: "topic_merge",
  }),
  mergedFrom: many(topicTable, { relationName: "topic_merge" }),
  articles: many(articleTopicsTable),
  events: many(eventsTable),
}));

export const articleTopicRelations = relations(articleTopicsTable, ({ one }) => ({
  article: one(archiveTable, {
    fields: [articleTopicsTable.archiveId],
    references: [archiveTable.id],
  }),
  topic: one(topicTable, {
    fields: [articleTopicsTable.topicId],
    references: [topicTable.id],
  }),
}));

export const eventRelations = relations(eventsTable, ({ one, many }) => ({
  topic: one(topicTable, {
    fields: [eventsTable.topicId],
    references: [topicTable.id],
  }),
  sources: many(eventSourcesTable),
  entities: many(eventEntitiesTable),
}));

export const eventSourceRelations = relations(eventSourcesTable, ({ one }) => ({
  event: one(eventsTable, {
    fields: [eventSourcesTable.eventId],
    references: [eventsTable.id],
  }),
  revision: one(sourceRevisionsTable, {
    fields: [eventSourcesTable.sourceRevisionId],
    references: [sourceRevisionsTable.id],
  }),
}));

export const eventEntityRelations = relations(eventEntitiesTable, ({ one }) => ({
  event: one(eventsTable, {
    fields: [eventEntitiesTable.eventId],
    references: [eventsTable.id],
  }),
  entity: one(entityTable, {
    fields: [eventEntitiesTable.entityId],
    references: [entityTable.id],
  }),
}));

export const storyLeadRelations = relations(storyLeadsTable, ({ one, many }) => ({
  assignee: one(usersTable, {
    fields: [storyLeadsTable.assigneeId],
    references: [usersTable.id],
    relationName: "lead_assignee",
  }),
  article: one(editorialArticlesTable, {
    fields: [storyLeadsTable.editorialArticleId],
    references: [editorialArticlesTable.id],
  }),
  sources: many(storyLeadSourcesTable),
  topics: many(storyLeadTopicsTable),
  entities: many(storyLeadEntitiesTable),
}));

export const storyLeadSourceRelations = relations(storyLeadSourcesTable, ({ one }) => ({
  lead: one(storyLeadsTable, {
    fields: [storyLeadSourcesTable.storyLeadId],
    references: [storyLeadsTable.id],
  }),
  revision: one(sourceRevisionsTable, {
    fields: [storyLeadSourcesTable.sourceRevisionId],
    references: [sourceRevisionsTable.id],
  }),
}));

export const storyLeadTopicRelations = relations(storyLeadTopicsTable, ({ one }) => ({
  lead: one(storyLeadsTable, {
    fields: [storyLeadTopicsTable.storyLeadId],
    references: [storyLeadsTable.id],
  }),
  topic: one(topicTable, {
    fields: [storyLeadTopicsTable.topicId],
    references: [topicTable.id],
  }),
}));

export const storyLeadEntityRelations = relations(storyLeadEntitiesTable, ({ one }) => ({
  lead: one(storyLeadsTable, {
    fields: [storyLeadEntitiesTable.storyLeadId],
    references: [storyLeadsTable.id],
  }),
  entity: one(entityTable, {
    fields: [storyLeadEntitiesTable.entityId],
    references: [entityTable.id],
  }),
}));

export const editorialArticleRelations = relations(editorialArticlesTable, ({ one, many }) => ({
  createdBy: one(usersTable, {
    fields: [editorialArticlesTable.createdBy],
    references: [usersTable.id],
  }),
  revisions: many(editorialRevisionsTable),
  leads: many(storyLeadsTable),
  usages: many(mediaUsagesTable),
  assignments: many(assignmentsTable),
  distribution: many(distributionItemsTable),
  corrections: many(correctionsTable),
}));

export const editorialRevisionRelations = relations(editorialRevisionsTable, ({ one, many }) => ({
  article: one(editorialArticlesTable, {
    fields: [editorialRevisionsTable.editorialArticleId],
    references: [editorialArticlesTable.id],
  }),
  cover: one(mediaAssetsTable, {
    fields: [editorialRevisionsTable.coverAssetId],
    references: [mediaAssetsTable.id],
  }),
  editor: one(usersTable, {
    fields: [editorialRevisionsTable.editorId],
    references: [usersTable.id],
    relationName: "revision_editor",
  }),
  approver: one(usersTable, {
    fields: [editorialRevisionsTable.approvedBy],
    references: [usersTable.id],
    relationName: "revision_approver",
  }),
  sources: many(editorialSourcesTable),
  claims: many(claimsTable),
}));

export const editorialSourceRelations = relations(editorialSourcesTable, ({ one }) => ({
  revision: one(editorialRevisionsTable, {
    fields: [editorialSourcesTable.editorialRevisionId],
    references: [editorialRevisionsTable.id],
  }),
  sourceRevision: one(sourceRevisionsTable, {
    fields: [editorialSourcesTable.sourceRevisionId],
    references: [sourceRevisionsTable.id],
  }),
}));

export const claimRelations = relations(claimsTable, ({ one, many }) => ({
  revision: one(editorialRevisionsTable, {
    fields: [claimsTable.editorialRevisionId],
    references: [editorialRevisionsTable.id],
  }),
  evidence: many(claimEvidenceTable),
  corrections: many(correctionClaimsTable),
}));

export const claimEvidenceRelations = relations(claimEvidenceTable, ({ one }) => ({
  claim: one(claimsTable, {
    fields: [claimEvidenceTable.claimId],
    references: [claimsTable.id],
  }),
  revision: one(sourceRevisionsTable, {
    fields: [claimEvidenceTable.sourceRevisionId],
    references: [sourceRevisionsTable.id],
  }),
}));

export const mediaUsageRelations = relations(mediaUsagesTable, ({ one }) => ({
  asset: one(mediaAssetsTable, {
    fields: [mediaUsagesTable.assetId],
    references: [mediaAssetsTable.id],
  }),
  article: one(editorialArticlesTable, {
    fields: [mediaUsagesTable.editorialArticleId],
    references: [editorialArticlesTable.id],
  }),
  entity: one(entityTable, {
    fields: [mediaUsagesTable.entityId],
    references: [entityTable.id],
  }),
}));

export const assignmentRelations = relations(assignmentsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [assignmentsTable.userId],
    references: [usersTable.id],
  }),
  lead: one(storyLeadsTable, {
    fields: [assignmentsTable.storyLeadId],
    references: [storyLeadsTable.id],
  }),
  topic: one(topicTable, {
    fields: [assignmentsTable.topicId],
    references: [topicTable.id],
  }),
  article: one(editorialArticlesTable, {
    fields: [assignmentsTable.editorialArticleId],
    references: [editorialArticlesTable.id],
  }),
}));

export const distributionItemRelations = relations(distributionItemsTable, ({ one, many }) => ({
  article: one(editorialArticlesTable, {
    fields: [distributionItemsTable.editorialArticleId],
    references: [editorialArticlesTable.id],
  }),
  revision: one(editorialRevisionsTable, {
    fields: [distributionItemsTable.editorialRevisionId],
    references: [editorialRevisionsTable.id],
  }),
  corrections: many(correctionDistributionTable),
}));

export const correctionRelations = relations(correctionsTable, ({ one, many }) => ({
  article: one(editorialArticlesTable, {
    fields: [correctionsTable.editorialArticleId],
    references: [editorialArticlesTable.id],
  }),
  before: one(editorialRevisionsTable, {
    fields: [correctionsTable.beforeRevisionId],
    references: [editorialRevisionsTable.id],
    relationName: "correction_before",
  }),
  after: one(editorialRevisionsTable, {
    fields: [correctionsTable.afterRevisionId],
    references: [editorialRevisionsTable.id],
    relationName: "correction_after",
  }),
  sourceRevision: one(sourceRevisionsTable, {
    fields: [correctionsTable.sourceRevisionId],
    references: [sourceRevisionsTable.id],
  }),
  editor: one(usersTable, {
    fields: [correctionsTable.editorId],
    references: [usersTable.id],
  }),
  claims: many(correctionClaimsTable),
  distribution: many(correctionDistributionTable),
}));

export const correctionClaimRelations = relations(correctionClaimsTable, ({ one }) => ({
  correction: one(correctionsTable, {
    fields: [correctionClaimsTable.correctionId],
    references: [correctionsTable.id],
  }),
  claim: one(claimsTable, {
    fields: [correctionClaimsTable.claimId],
    references: [claimsTable.id],
  }),
}));

export const correctionDistributionRelations = relations(correctionDistributionTable, ({ one }) => ({
  correction: one(correctionsTable, {
    fields: [correctionDistributionTable.correctionId],
    references: [correctionsTable.id],
  }),
  item: one(distributionItemsTable, {
    fields: [correctionDistributionTable.distributionItemId],
    references: [distributionItemsTable.id],
  }),
}));

export const auditLogRelations = relations(auditLogTable, ({ one }) => ({
  actor: one(usersTable, {
    fields: [auditLogTable.actorId],
    references: [usersTable.id],
  }),
}));
