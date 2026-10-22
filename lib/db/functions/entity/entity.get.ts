import { and, asc, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { entityReviewStatus } from "@/lib/entity-review";
import { db } from "@/lib/db";
import {
  archiveTable,
  articleTopicsTable,
  entityAliasesTable,
  entityMentionsTable,
  entityTable,
  eventSourcesTable,
  eventsTable,
  ingestTable,
  mediaAssetsTable,
  publishersTable,
  sourceRevisionsTable,
  topicTable,
} from "@/lib/db/schema";
import type { DatePrecision, Entity, TopicEvent } from "@/lib/types";

export type LinkedArticle = {
  id: string;
  slug: string;
  title: string;
  publisher: string;
  publishedAt: string;
};

export type EntityTopicRef = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export type EntityEventRef = {
  topicSlug: string;
  topicName: string;
  event: TopicEvent;
};

export type EntityDetail = {
  entity: Entity;
  articles: LinkedArticle[];
  topics: EntityTopicRef[];
  events: EntityEventRef[];
};

function httpsUrl(url: string | null | undefined): string {
  return typeof url === "string" && /^https:\/\//i.test(url) ? url : "";
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const mentionCount = sql<number>`count(${entityMentionsTable.id})`.mapWith(Number);
const articleCount = sql<number>`count(distinct ${archiveTable.id})`.mapWith(Number);
const acceptedCount =
  sql<number>`count(${entityMentionsTable.id}) filter (where ${entityMentionsTable.status} = 'accepted')`.mapWith(
    Number,
  );
const suggestedCount =
  sql<number>`count(${entityMentionsTable.id}) filter (where ${entityMentionsTable.status} = 'suggested')`.mapWith(
    Number,
  );

function toEntity(row: {
  id: number;
  name: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  mentionCount: unknown;
  articleCount: unknown;
  acceptedCount: unknown;
  suggestedCount: unknown;
  aliases?: string[];
  articleSlugs?: string[];
}): Entity {
  return {
    id: String(row.id),
    name: row.name,
    slug: String(row.id),
    category: row.category,
    mentionCount: num(row.mentionCount),
    articleCount: num(row.articleCount),
    reviewStatus: entityReviewStatus(num(row.acceptedCount), num(row.suggestedCount)),
    imageUrl: httpsUrl(row.imageUrl),
    description: row.description ?? "",
    aliases: row.aliases ?? [],
    articleSlugs: row.articleSlugs ?? [],
  };
}

function entityQuery(id?: number) {
  return db
    .select({
      id: entityTable.id,
      name: entityTable.name,
      category: entityTable.category,
      description: entityTable.description,
      imageUrl: mediaAssetsTable.sourceUrl,
      mentionCount,
      articleCount,
      acceptedCount,
      suggestedCount,
    })
    .from(entityTable)
    .leftJoin(
      mediaAssetsTable,
      and(
        eq(mediaAssetsTable.id, entityTable.primaryImageAssetId),
        isNull(mediaAssetsTable.deletedAt),
      ),
    )
    .leftJoin(
      entityMentionsTable,
      and(
        eq(entityMentionsTable.entityId, entityTable.id),
        ne(entityMentionsTable.status, "removed"),
      ),
    )
    .leftJoin(
      sourceRevisionsTable,
      eq(sourceRevisionsTable.id, entityMentionsTable.sourceRevisionId),
    )
    .leftJoin(
      archiveTable,
      and(
        eq(archiveTable.id, sourceRevisionsTable.archiveId),
        isNull(archiveTable.deletedAt),
      ),
    )
    .where(
      and(
        isNull(entityTable.deletedAt),
        isNull(entityTable.mergedIntoId),
        id == null ? undefined : eq(entityTable.id, id),
      ),
    )
    .groupBy(entityTable.id, mediaAssetsTable.sourceUrl);
}

export async function listEntities(): Promise<Entity[]> {
  const rows = await entityQuery().orderBy(desc(mentionCount), asc(entityTable.name));
  return rows.map((row) => toEntity(row));
}

function toArticle(row: {
  id: number;
  title: string | null;
  url: string;
  publisher: string;
  publishedAt: Date | null;
}): LinkedArticle {
  return {
    id: String(row.id),
    slug: String(row.id),
    title: row.title?.trim() || row.url,
    publisher: row.publisher,
    publishedAt: row.publishedAt?.toISOString() ?? "",
  };
}

function datePrecision(certainty: "known" | "approximate" | "unknown"): DatePrecision {
  return certainty === "known" ? "exact" : certainty;
}

export async function getEntityDetail(id: number): Promise<EntityDetail | null> {
  const [row] = await entityQuery(id).limit(1);
  if (!row) return null;

  const [aliasRows, articleRows, topicRows, eventRows] = await Promise.all([
    db
      .select({ alias: entityAliasesTable.alias })
      .from(entityAliasesTable)
      .where(eq(entityAliasesTable.entityId, id))
      .orderBy(asc(entityAliasesTable.alias)),
    db
      .select({
        id: archiveTable.id,
        title: sourceRevisionsTable.title,
        url: archiveTable.url,
        publisher: publishersTable.name,
        publishedAt: sourceRevisionsTable.publishedAt,
      })
      .from(entityMentionsTable)
      .innerJoin(
        sourceRevisionsTable,
        eq(entityMentionsTable.sourceRevisionId, sourceRevisionsTable.id),
      )
      .innerJoin(
        archiveTable,
        and(
          eq(archiveTable.id, sourceRevisionsTable.archiveId),
          isNull(archiveTable.deletedAt),
        ),
      )
      .innerJoin(ingestTable, eq(archiveTable.ingestId, ingestTable.id))
      .innerJoin(publishersTable, eq(ingestTable.publisherId, publishersTable.id))
      .where(
        and(eq(entityMentionsTable.entityId, id), ne(entityMentionsTable.status, "removed")),
      ),
    db
      .select({
        id: topicTable.id,
        name: topicTable.name,
        description: topicTable.description,
      })
      .from(entityMentionsTable)
      .innerJoin(
        sourceRevisionsTable,
        eq(entityMentionsTable.sourceRevisionId, sourceRevisionsTable.id),
      )
      .innerJoin(
        articleTopicsTable,
        and(
          eq(articleTopicsTable.archiveId, sourceRevisionsTable.archiveId),
          ne(articleTopicsTable.status, "removed"),
        ),
      )
      .innerJoin(topicTable, eq(articleTopicsTable.topicId, topicTable.id))
      .where(
        and(
          eq(entityMentionsTable.entityId, id),
          ne(entityMentionsTable.status, "removed"),
          isNull(topicTable.deletedAt),
          isNull(topicTable.mergedIntoId),
        ),
      ),
    db
      .select({
        id: eventsTable.id,
        title: eventsTable.title,
        summary: eventsTable.summary,
        eventDate: eventsTable.eventDate,
        dateCertainty: eventsTable.dateCertainty,
        position: eventsTable.position,
        topicId: topicTable.id,
        topicName: topicTable.name,
        archiveId: sourceRevisionsTable.archiveId,
      })
      .from(entityMentionsTable)
      .innerJoin(
        sourceRevisionsTable,
        eq(entityMentionsTable.sourceRevisionId, sourceRevisionsTable.id),
      )
      .innerJoin(
        eventSourcesTable,
        eq(eventSourcesTable.sourceRevisionId, sourceRevisionsTable.id),
      )
      .innerJoin(eventsTable, eq(eventSourcesTable.eventId, eventsTable.id))
      .innerJoin(topicTable, eq(eventsTable.topicId, topicTable.id))
      .where(
        and(
          eq(entityMentionsTable.entityId, id),
          ne(entityMentionsTable.status, "removed"),
          isNull(topicTable.deletedAt),
        ),
      ),
  ]);

  const articles = [...new Map(articleRows.map((article) => [article.id, toArticle(article)])).values()];
  const topics = [
    ...new Map(
      topicRows.map((topic) => [
        topic.id,
        {
          id: String(topic.id),
          slug: String(topic.id),
          name: topic.name,
          description: topic.description ?? "",
        },
      ]),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const eventsById = new Map<number, EntityEventRef>();
  for (const event of eventRows) {
    const current = eventsById.get(event.id) ?? {
      topicSlug: String(event.topicId),
      topicName: event.topicName,
      event: {
        id: String(event.id),
        title: event.title,
        summary: event.summary ?? "",
        eventDate: event.eventDate?.toISOString() ?? null,
        datePrecision: datePrecision(event.dateCertainty),
        articleSlugs: [],
      },
    };
    const slug = String(event.archiveId);
    if (!current.event.articleSlugs.includes(slug)) current.event.articleSlugs.push(slug);
    eventsById.set(event.id, current);
  }

  return {
    entity: toEntity({
      ...row,
      aliases: aliasRows.map((alias) => alias.alias),
      articleSlugs: articles.map((article) => article.slug),
    }),
    articles,
    topics,
    events: [...eventsById.values()].sort((a, b) => {
      const left = a.event.eventDate ? Date.parse(a.event.eventDate) : Number.POSITIVE_INFINITY;
      const right = b.event.eventDate ? Date.parse(b.event.eventDate) : Number.POSITIVE_INFINITY;
      return left - right || a.event.title.localeCompare(b.event.title);
    }),
  };
}
