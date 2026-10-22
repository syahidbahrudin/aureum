import { createHash } from "node:crypto";

export type DiscoveredItem = {
  url: string;
  sourceKey?: string;
  title?: string;
  body?: string;
  image?: string;
  author?: string;
  publishedAt?: string;
};

export function getPath(obj: unknown, path: string): unknown {
  let current: unknown = obj;
  for (const key of path.split(".")) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function asText(value: unknown): string | undefined {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text || undefined;
}

export function mapApiItems(
  payload: unknown,
  mapping: Record<string, string> | null | undefined,
): DiscoveredItem[] {
  const raw = mapping?.items
    ? getPath(payload, mapping.items)
    : Array.isArray(payload)
      ? payload
      : getPath(payload, "items");
  if (!Array.isArray(raw)) return [];

  const items: DiscoveredItem[] = [];
  for (const row of raw) {
    const url = asText(getPath(row, mapping?.url ?? "url"));
    if (!url) continue;
    items.push({
      url,
      sourceKey: asText(getPath(row, mapping?.id ?? "id")),
      title: asText(getPath(row, mapping?.title ?? "title")),
      body: asText(getPath(row, mapping?.body ?? "body")),
      image: asText(getPath(row, mapping?.image ?? "image")),
      author: asText(getPath(row, mapping?.author ?? "author")),
      publishedAt: asText(getPath(row, mapping?.publishedAt ?? "publishedAt")),
    });
  }
  return items;
}

export function filterNewItems<T extends { url: string }>(
  items: T[],
  existing: Iterable<string>,
): { fresh: T[]; duplicateCount: number } {
  const seen = new Set(existing);
  const fresh: T[] = [];
  let duplicateCount = 0;
  for (const item of items) {
    const url = item.url.trim();
    if (!url) continue;
    if (seen.has(url)) {
      duplicateCount += 1;
      continue;
    }
    seen.add(url);
    fresh.push({ ...item, url });
  }
  return { fresh, duplicateCount };
}

export function contentHash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function chunkText(text: string, size = 1000): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const chunks: string[] = [];
  for (let i = 0; i < trimmed.length; i += size) {
    chunks.push(trimmed.slice(i, i + size));
  }
  return chunks;
}

export function pointUuid(revisionId: number, chunkKey: string): string {
  const hex = createHash("sha1")
    .update(`archive:${revisionId}:${chunkKey}`)
    .digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function parseSourceDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function nextApiUrl(
  current: string,
  payload: unknown,
  pagination: Record<string, unknown> | null | undefined,
  pageIndex: number,
): string | null {
  if (!pagination) return null;
  if (typeof pagination.next === "string" && pagination.next) {
    const next = getPath(payload, pagination.next);
    return typeof next === "string" && next.trim() ? next.trim() : null;
  }
  if (typeof pagination.pageParam === "string" && pagination.pageParam) {
    if (pageIndex >= 2) return null;
    const url = new URL(current);
    const start = Number(pagination.pageStart ?? 1);
    url.searchParams.set(
      pagination.pageParam,
      String((Number.isFinite(start) ? start : 1) + pageIndex + 1),
    );
    return url.toString();
  }
  return null;
}

export function modelName(raw: string): string {
  return raw.replace(/^openai\//, "");
}
