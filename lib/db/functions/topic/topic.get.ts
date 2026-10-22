import { and, asc, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import { entityReviewStatus } from "@/lib/entity-review";
import { db } from "@/lib/db";
import {
  archiveTable,
  articleTopicsTable,
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
import type { DatePrecision, Entity, Topic, TopicEvent } from "@/lib/types";

export type LinkedArticle = {
  id: string;
  slug: string;
  title: string;
  publisher: string;
  publishedAt: string;
};

export type TopicEntityRef = {
  id: string;
  slug: string;
  name: string;
  category: string;
  reviewStatus: Entity["reviewStatus"];
  imageUrl: string;
};

export type TopicDetail = {
  topic: Topic;
  articles: LinkedArticle[];
  entities: TopicEntityRef[];
};

function httpsUrl(url: string | null | undefined): string {
  return typeof url === "string" && /^https:\/\//i.test(url) ? url : "";
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function datePrecision(certainty: "known" | "approximate" | "unknown"): DatePrecision {
  return certainty === "known" ? "exact" : certainty;
}

const emptySummary = { text: "", articleSlugs: [] as string[] };

const linkedArticleCount =
  sql<number>`count(distinct ${articleTopicsTable.archiveId}) filter (where ${articleTopicsTable.status} <> 'removed')`.mapWith(
    Number,
  );
const linkedEventCount = sql<number>`count(distinct ${eventsTable.id})`.mapWith(Number);

function toTopic(row: {
  id: number;
  name: string;
  description: string | null;
  updatedAt: Date;
  archivedAt: Date | null;
  imageUrl: string | null;
  articleCount: unknown;
  eventCount: unknown;
  events?: TopicEvent[];
}): Topic {
  return {
    id: String(row.id),
    name: row.name,
    slug: String(row.id),
    description: row.description ?? "",
    status: row.archivedAt ? "archived" : "active",
    updatedAt: row.updatedAt.toISOString(),
    thumbnailUrl: httpsUrl(row.imageUrl),
    background: emptySummary,
    latest: emptySummary,
    events: row.events ?? [],
    articleCount: num(row.articleCount),
    eventCount: num(row.eventCount),
  };
}

function topicQuery(id?: number) {
  return db
    .select({
      id: topicTable.id,
      name: topicTable.name,
      description: topicTable.description,
      updatedAt: topicTable.updatedAt,
      archivedAt: topicTable.archivedAt,
      imageUrl: mediaAssetsTable.sourceUrl,
      articleCount: linkedArticleCount,
      eventCount: linkedEventCount,
    })
    .from(topicTable)
    .leftJoin(
      mediaAssetsTable,
      and(eq(mediaAssetsTable.id, topicTable.imageAssetId), isNull(mediaAssetsTable.deletedAt)),
    )
    .leftJoin(articleTopicsTable, eq(articleTopicsTable.topicId, topicTable.id))
    .leftJoin(eventsTable, eq(eventsTable.topicId, topicTable.id))
    .where(
      and(
        isNull(topicTable.deletedAt),
        isNull(topicTable.mergedIntoId),
        id == null ? undefined : eq(topicTable.id, id),
      ),
    )
    .groupBy(topicTable.id, mediaAssetsTable.sourceUrl);
}

export async function listTopics(): Promise<Topic[]> {
  const rows = await topicQuery().orderBy(desc(topicTable.updatedAt), asc(topicTable.name));
  return rows.map((row) => toTopic(row));
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

export async function getTopicDetail(id: number): Promise<TopicDetail | null> {
  const [row] = await topicQuery(id).limit(1);
  if (!row) return null;

  const [articleRows, eventRows] = await Promise.all([
    db
      .select({
        id: archiveTable.id,
        title: sourceRevisionsTable.title,
        url: archiveTable.url,
        publisher: publishersTable.name,
        publishedAt: sourceRevisionsTable.publishedAt,
      })
      .from(articleTopicsTable)
      .innerJoin(archiveTable, eq(articleTopicsTable.archiveId, archiveTable.id))
      .innerJoin(
        sourceRevisionsTable,
        and(
          eq(sourceRevisionsTable.archiveId, archiveTable.id),
          eq(sourceRevisionsTable.isCurrent, true),
        ),
      )
      .innerJoin(ingestTable, eq(archiveTable.ingestId, ingestTable.id))
      .innerJoin(publishersTable, eq(ingestTable.publisherId, publishersTable.id))
      .where(
        and(
          eq(articleTopicsTable.topicId, id),
          ne(articleTopicsTable.status, "removed"),
          isNull(archiveTable.deletedAt),
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
        archiveId: archiveTable.id,
        articleTitle: sourceRevisionsTable.title,
        url: archiveTable.url,
        publisher: publishersTable.name,
        publishedAt: sourceRevisionsTable.publishedAt,
      })
      .from(eventsTable)
      .leftJoin(eventSourcesTable, eq(eventSourcesTable.eventId, eventsTable.id))
      .leftJoin(
        sourceRevisionsTable,
        eq(eventSourcesTable.sourceRevisionId, sourceRevisionsTable.id),
      )
      .leftJoin(
        archiveTable,
        and(
          eq(archiveTable.id, sourceRevisionsTable.archiveId),
          isNull(archiveTable.deletedAt),
        ),
      )
      .leftJoin(ingestTable, eq(archiveTable.ingestId, ingestTable.id))
      .leftJoin(publishersTable, eq(ingestTable.publisherId, publishersTable.id))
      .where(eq(eventsTable.topicId, id))
      .orderBy(asc(eventsTable.position), asc(eventsTable.id)),
  ]);

  const articles = new Map(articleRows.map((article) => [article.id, toArticle(article)]));
  const eventsById = new Map<number, TopicEvent & { position: number }>();
  for (const event of eventRows) {
    const current = eventsById.get(event.id) ?? {
      id: String(event.id),
      title: event.title,
      summary: event.summary ?? "",
      eventDate: event.eventDate?.toISOString() ?? null,
      datePrecision: datePrecision(event.dateCertainty),
      articleSlugs: [],
      position: event.position,
    };
    if (event.archiveId != null && event.url && event.publisher) {
      const slug = String(event.archiveId);
      if (!current.articleSlugs.includes(slug)) current.articleSlugs.push(slug);
      if (!articles.has(event.archiveId)) {
        articles.set(
          event.archiveId,
          toArticle({
            id: event.archiveId,
            title: event.articleTitle,
            url: event.url,
            publisher: event.publisher,
            publishedAt: event.publishedAt,
          }),
        );
      }
    }
    eventsById.set(event.id, current);
  }
  const events = [...eventsById.values()].sort(
    (a, b) => a.position - b.position || a.title.localeCompare(b.title),
  );

  const archiveIds = [...articles.keys()];
  const entityRows =
    archiveIds.length === 0
      ? []
      : await db
          .select({
            id: entityTable.id,
            name: entityTable.name,
            category: entityTable.category,
            imageUrl: mediaAssetsTable.sourceUrl,
            acceptedCount:
              sql<number>`count(${entityMentionsTable.id}) filter (where ${entityMentionsTable.status} = 'accepted')`.mapWith(
                Number,
              ),
            suggestedCount:
              sql<number>`count(${entityMentionsTable.id}) filter (where ${entityMentionsTable.status} = 'suggested')`.mapWith(
                Number,
              ),
          })
          .from(entityMentionsTable)
          .innerJoin(entityTable, eq(entityMentionsTable.entityId, entityTable.id))
          .innerJoin(
            sourceRevisionsTable,
            eq(entityMentionsTable.sourceRevisionId, sourceRevisionsTable.id),
          )
          .leftJoin(
            mediaAssetsTable,
            and(
              eq(mediaAssetsTable.id, entityTable.primaryImageAssetId),
              isNull(mediaAssetsTable.deletedAt),
            ),
          )
          .where(
            and(
              inArray(sourceRevisionsTable.archiveId, archiveIds),
              ne(entityMentionsTable.status, "removed"),
              isNull(entityTable.deletedAt),
              isNull(entityTable.mergedIntoId),
            ),
          )
          .groupBy(entityTable.id, mediaAssetsTable.sourceUrl)
          .orderBy(asc(entityTable.name));

  return {
    topic: toTopic({
      ...row,
      events: events.map(({ position: _position, ...event }) => event),
    }),
    articles: [...articles.values()],
    entities: entityRows.map((entity) => ({
      id: String(entity.id),
      slug: String(entity.id),
      name: entity.name,
      category: entity.category,
      reviewStatus: entityReviewStatus(num(entity.acceptedCount), num(entity.suggestedCount)),
      imageUrl: httpsUrl(entity.imageUrl),
    })),
  };
}
