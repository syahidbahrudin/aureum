import { and, count, desc, eq, isNull ,sql} from "drizzle-orm";
import { db } from "@/lib/db";
import {
  archiveTable,
  articleTopicsTable,
  entityMentionsTable,
  entityTable,
  ingestTable,
  publishersTable,
  sourceRevisionsTable,
  topicTable,
} from "@/lib/db/schema";
import type { ArchiveArticle, ProcessingStatus } from "@/lib/types";

export type ArchiveEntityName = {
  id: number;
  name: string;
  category: string;
};

export type ArchiveTopicName = {
  id: number;
  name: string;
  description: string;
};

function httpImage(urls: unknown): string {
  if (!Array.isArray(urls)) return "";
  const match = urls.find(
    (url) => typeof url === "string" && /^https?:\/\//i.test(url),
  );
  return typeof match === "string" ? match : "";
}

function paragraphs(text: string | null): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function toArticle(row: {
  id: number;
  url: string;
  language: string | null;
  processingStatus: ProcessingStatus;
  title: string | null;
  author: string | null;
  originalText?: string | null;
  cleanedText?: string | null;
  tags: string[];
  imageUrls: string[];
  publishedAt: Date | null;
  fetchedAt: Date;
  sourceName: string;
  publisher: string;
}): ArchiveArticle {
  return {
    id: String(row.id),
    slug: String(row.id),
    title: row.title?.trim() || row.url,
    publisher: row.publisher,
    sourceName: row.sourceName,
    originalUrl: row.url,
    author: row.author?.trim() || "",
    body: paragraphs(row.cleanedText ?? row.originalText ?? null),
    markdown: (row.originalText ?? row.cleanedText ?? "").trim(),
    publishedAt: row.publishedAt?.toISOString() ?? "",
    fetchedAt: row.fetchedAt.toISOString(),
    language: row.language ?? "",
    tags: row.tags,
    status: row.processingStatus,
    thumbnailUrl: httpImage(row.imageUrls),
  };
}

export const ARCHIVE_PAGE_SIZE = 24;

const articleSelect = {
  id: archiveTable.id,
  url: archiveTable.url,
  language: archiveTable.language,
  processingStatus: archiveTable.processingStatus,
  title: sourceRevisionsTable.title,
  author: sourceRevisionsTable.author,
  originalText: sourceRevisionsTable.originalText,
  cleanedText: sourceRevisionsTable.cleanedText,
  tags: sourceRevisionsTable.tags,
  imageUrls: sourceRevisionsTable.imageUrls,
  publishedAt: sourceRevisionsTable.publishedAt,
  fetchedAt: sourceRevisionsTable.fetchedAt,
  revisionId: sourceRevisionsTable.id,
  sourceName: ingestTable.name,
  publisher: publishersTable.name,
};

const listSelect = {
  id: archiveTable.id,
  url: archiveTable.url,
  language: archiveTable.language,
  processingStatus: archiveTable.processingStatus,
  title: sourceRevisionsTable.title,
  author: sourceRevisionsTable.author,
  tags: sourceRevisionsTable.tags,
  imageUrls: sourceRevisionsTable.imageUrls,
  publishedAt: sourceRevisionsTable.publishedAt,
  fetchedAt: sourceRevisionsTable.fetchedAt,
  sourceName: ingestTable.name,
  publisher: publishersTable.name,
};

export async function listArchive(page = 1): Promise<{
  articles: ArchiveArticle[];
  total: number;
  page: number;
  pages: number;
}> {
  const joins = {
    revision: and(
      eq(sourceRevisionsTable.archiveId, archiveTable.id),
      eq(sourceRevisionsTable.isCurrent, true),
    ),
  };
  const [totalRow] = await db
    .select({ total: count() })
    .from(archiveTable)
    .where(isNull(archiveTable.deletedAt));
  const total = Number(totalRow?.total ?? 0);
  const pages = Math.max(1, Math.ceil(total / ARCHIVE_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);

  const rows = await db
    .select(listSelect)
    .from(archiveTable)
    .innerJoin(sourceRevisionsTable, joins.revision)
    .innerJoin(ingestTable, eq(archiveTable.ingestId, ingestTable.id))
    .innerJoin(publishersTable, eq(ingestTable.publisherId, publishersTable.id))
    .where(isNull(archiveTable.deletedAt))
    .orderBy(desc(sourceRevisionsTable.fetchedAt))
    .limit(ARCHIVE_PAGE_SIZE)
    .offset((current - 1) * ARCHIVE_PAGE_SIZE);

  return { articles: rows.map(toArticle), total, page: current, pages };
}

export async function getArchive(id: number): Promise<{
  article: ArchiveArticle;
  entities: ArchiveEntityName[];
  topics: ArchiveTopicName[];
} | null> {
  const [row] = await db
    .select(articleSelect)
    .from(archiveTable)
    .innerJoin(
      sourceRevisionsTable,
      and(
        eq(sourceRevisionsTable.archiveId, archiveTable.id),
        eq(sourceRevisionsTable.isCurrent, true),
      ),
    )
    .innerJoin(ingestTable, eq(archiveTable.ingestId, ingestTable.id))
    .innerJoin(publishersTable, eq(ingestTable.publisherId, publishersTable.id))
    .where(and(eq(archiveTable.id, id), isNull(archiveTable.deletedAt)))
    .limit(1);
  if (!row) return null;

  const [entities, topics] = await Promise.all([
    db
      .select({
        id: entityTable.id,
        name: entityTable.name,
        category: entityTable.category,
      })
      .from(entityMentionsTable)
      .innerJoin(entityTable, eq(entityMentionsTable.entityId, entityTable.id))
      .where(
        and(
          eq(entityMentionsTable.sourceRevisionId, row.revisionId),
          isNull(entityTable.deletedAt),
        ),
      ),
    db
      .select({
        id: topicTable.id,
        name: topicTable.name,
        description: topicTable.description,
      })
      .from(articleTopicsTable)
      .innerJoin(topicTable, eq(articleTopicsTable.topicId, topicTable.id))
      .where(
        and(eq(articleTopicsTable.archiveId, id), isNull(topicTable.deletedAt)),
      ),
  ]);

  const seen = new Set<number>();
  const uniqueEntities = entities.filter((entity) => {
    if (seen.has(entity.id)) return false;
    seen.add(entity.id);
    return true;
  });

  return {
    article: toArticle(row),
    entities: uniqueEntities,
    topics: topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description ?? "",
    })),
  };
}
