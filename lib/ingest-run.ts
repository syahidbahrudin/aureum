import Parser from "rss-parser";
import { fetch as undiciFetch } from "undici";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  archiveTable,
  ingestHistoryTable,
  ingestTable,
  sourceRevisionsTable,
} from "@/lib/db/schema";
import { originalArticle } from "@/lib/archive-enrich";
import { mapURL, scrapURL } from "@/lib/crawl/scrap";
import {
  assertPublicIngestUrl,
  ingestDispatcher,
  ingestKey,
  openSecret,
} from "@/lib/ingest-net";
import {
  contentHash,
  filterNewItems,
  mapApiItems,
  nextApiUrl,
  parseSourceDate,
  type DiscoveredItem,
} from "@/lib/ingest-pipeline";

const NEW_CAP = 25;
const MAP_CAP = 50;
const API_PAGES = 3;
const MAX_BYTES = 2_000_000;
const FETCH_MS = 15_000;

type IngestRow = typeof ingestTable.$inferSelect;

function uniqueConstraint(error: unknown): boolean {
  let current: unknown = error;
  for (let i = 0; i < 5 && current && typeof current === "object"; i++) {
    if ("code" in current && (current as { code: unknown }).code === "23505") {
      return true;
    }
    current = "cause" in current ? (current as { cause: unknown }).cause : null;
  }
  return false;
}

export async function loadActiveIngest(id: number): Promise<IngestRow | null> {
  const [row] = await db
    .select()
    .from(ingestTable)
    .where(and(eq(ingestTable.id, id), isNull(ingestTable.deletedAt)))
    .limit(1);
  if (!row || row.status !== "active") return null;
  return row;
}

export async function openIngestHistory(ingestId: number): Promise<number> {
  const [row] = await db
    .insert(ingestHistoryTable)
    .values({ ingestId, status: "running" })
    .returning({ id: ingestHistoryTable.id });
  return row.id;
}

export async function closeIngestHistory(
  historyId: number,
  counts: {
    newCount: number;
    duplicateCount: number;
    failedCount: number;
    error?: string;
  },
) {
  await db
    .update(ingestHistoryTable)
    .set({
      status: counts.error ? "failed" : "succeeded",
      newCount: counts.newCount,
      duplicateCount: counts.duplicateCount,
      failedCount: counts.failedCount,
      error: counts.error ?? null,
      finishedAt: new Date(),
    })
    .where(eq(ingestHistoryTable.id, historyId));
}

async function safeFetchText(
  raw: string,
  headers: Record<string, string>,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  let current = raw;
  for (let hop = 0; hop < 4; hop++) {
    const blocked = await assertPublicIngestUrl(current);
    if (blocked) return { ok: false, error: blocked };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_MS);
    let res: Awaited<ReturnType<typeof undiciFetch>>;
    try {
      res = await undiciFetch(current, {
        headers,
        redirect: "manual",
        signal: controller.signal,
        dispatcher: ingestDispatcher,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { ok: false, error: "The source timed out." };
      }
      const cause = error instanceof Error ? error.cause : undefined;
      const detail = cause instanceof Error ? cause.message : "";
      return {
        ok: false,
        error: detail
          ? `The source could not be fetched (${detail}).`
          : "The source could not be fetched.",
      };
    } finally {
      clearTimeout(timer);
    }
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) {
        return { ok: false, error: "The source redirected without a location." };
      }
      current = new URL(location, current).toString();
      continue;
    }
    if (!res.ok) return { ok: false, error: `The source returned ${res.status}.` };
    const announced = Number(res.headers.get("content-length") ?? 0);
    if (announced > MAX_BYTES) {
      return { ok: false, error: "The source response is too large." };
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return { ok: false, error: "The source response is too large." };
    }
    return { ok: true, text: new TextDecoder().decode(buf) };
  }
  return { ok: false, error: "Too many redirects." };
}

function apiHeaders(source: IngestRow): Record<string, string> {
  const headers = { ...source.headers };
  if (source.authSecret && !headers.Authorization && !headers.authorization) {
    const key = ingestKey();
    if (key) headers.Authorization = `Bearer ${openSecret(source.authSecret, key)}`;
  }
  return headers;
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

async function discoverRss(source: IngestRow): Promise<DiscoveredItem[]> {
  const fetched = await safeFetchText(source.url, {});
  if (!fetched.ok) throw new Error(fetched.error);
  const feed = await new Parser<
    Record<string, never>,
    { id?: string; author?: string }
  >({
    customFields: { item: ["author", "id"] },
  }).parseString(fetched.text);
  const items: DiscoveredItem[] = [];
  const seen = new Set<string>();
  for (const item of feed.items) {
    const url = (item.link ?? "").trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    items.push({
      url,
      sourceKey: item.guid || item.id || undefined,
      title: item.title?.trim() || undefined,
      author: item.creator?.trim() || item.author?.trim() || undefined,
      publishedAt: item.isoDate || item.pubDate || undefined,
    });
  }
  return items;
}

async function discoverWebsite(source: IngestRow): Promise<DiscoveredItem[]> {
  const mapped = await mapURL(source.url, MAP_CAP);
  const home = trimSlash(source.url);
  const items: DiscoveredItem[] = [];
  const seen = new Set<string>();
  for (const link of mapped.links) {
    const url = link.url?.trim();
    if (!url || trimSlash(url) === home || seen.has(url)) continue;
    seen.add(url);
    items.push({ url, title: link.title?.trim() || undefined });
  }
  return items;
}

async function discoverApi(source: IngestRow): Promise<DiscoveredItem[]> {
  const headers = apiHeaders(source);
  const items: DiscoveredItem[] = [];
  let url = source.url;
  for (let page = 0; page < API_PAGES; page++) {
    const fetched = await safeFetchText(url, headers);
    if (!fetched.ok) throw new Error(fetched.error);
    let payload: unknown;
    try {
      payload = JSON.parse(fetched.text);
    } catch {
      throw new Error("The API response was not JSON.");
    }
    items.push(...mapApiItems(payload, source.fieldMapping));
    const next = nextApiUrl(url, payload, source.pagination, page);
    if (!next) break;
    url = next;
  }
  return items;
}

export async function discoverItems(ingestId: number): Promise<DiscoveredItem[]> {
  const source = await loadActiveIngest(ingestId);
  if (!source) return [];
  const blocked = await assertPublicIngestUrl(source.url);
  if (blocked) throw new Error(blocked);
  switch (source.type) {
    case "rss":
      return discoverRss(source);
    case "website":
      return discoverWebsite(source);
    case "api":
      return discoverApi(source);
  }
}

export async function listArchiveUrls(ingestId: number): Promise<string[]> {
  const rows = await db
    .select({ url: archiveTable.url })
    .from(archiveTable)
    .where(
      and(eq(archiveTable.ingestId, ingestId), isNull(archiveTable.deletedAt)),
    );
  return rows.map((row) => row.url);
}

type ScrapedItem = DiscoveredItem & { failed?: boolean };

async function fillBody(
  source: IngestRow,
  item: DiscoveredItem,
): Promise<ScrapedItem> {
  if (source.type === "api" || (source.type !== "rss" && item.body)) return item;
  try {
    const blocked = await assertPublicIngestUrl(item.url);
    if (blocked) return { ...item, failed: true };
    const doc = await scrapURL(item.url, "markdown");
    const image =
      item.image ||
      (typeof doc.metadata?.ogImage === "string" ? doc.metadata.ogImage : undefined) ||
      (typeof doc.metadata?.image === "string" ? doc.metadata.image : undefined);
    const title =
      item.title ||
      (typeof doc.metadata?.title === "string" ? doc.metadata.title : undefined);
    const author =
      item.author ||
      (typeof doc.metadata?.author === "string" ? doc.metadata.author : undefined);
    return {
      ...item,
      title,
      author,
      body: doc.markdown?.trim() || undefined,
      image,
      publishedAt:
        item.publishedAt ||
        (typeof doc.metadata?.publishedTime === "string"
          ? doc.metadata.publishedTime
          : undefined),
    };
  } catch {
    return { ...item, failed: true };
  }
}

export async function ingestNewItems(
  ingestId: number,
  items: DiscoveredItem[],
): Promise<{ archiveIds: number[]; duplicateCount: number; failedCount: number }> {
  const source = await loadActiveIngest(ingestId);
  if (!source) return { archiveIds: [], duplicateCount: 0, failedCount: 0 };

  const archiveIds: number[] = [];
  let duplicateCount = 0;
  let failedCount = 0;

  for (const item of items) {
    const scraped = await fillBody(source, item);
    if (scraped.failed || !scraped.body?.trim()) {
      failedCount += 1;
      continue;
    }
    let original = "";
    try {
      original = await originalArticle(scraped.body);
    } catch {
      failedCount += 1;
      continue;
    }
    if (!original) {
      failedCount += 1;
      continue;
    }
    try {
      await db.transaction(async (tx) => {
        const [archive] = await tx
          .insert(archiveTable)
          .values({
            ingestId,
            url: scraped.url,
            sourceKey: scraped.sourceKey ?? null,
            language: source.language,
            processingStatus: "ready",
          })
          .returning({ id: archiveTable.id });
        await tx.insert(sourceRevisionsTable).values({
          archiveId: archive.id,
          title: scraped.title ?? null,
          author: scraped.author ?? null,
          originalText: original,
          cleanedText: original,
          imageUrls: scraped.image ? [scraped.image] : [],
          publishedAt: parseSourceDate(scraped.publishedAt),
          contentHash: contentHash(original),
          isCurrent: true,
          fetchedAt: new Date(),
        });
        archiveIds.push(archive.id);
      });
    } catch (error) {
      if (uniqueConstraint(error)) duplicateCount += 1;
      else failedCount += 1;
    }
  }

  return { archiveIds, duplicateCount, failedCount };
}

export function planNewItems(
  items: DiscoveredItem[],
  existing: string[],
): { fresh: DiscoveredItem[]; duplicateCount: number } {
  const planned = filterNewItems(items, existing);
  return { fresh: planned.fresh.slice(0, NEW_CAP), duplicateCount: planned.duplicateCount };
}
