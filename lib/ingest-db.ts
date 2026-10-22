import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { archiveTable, ingestTable, publishersTable } from "@/lib/db/schema";
import { jsonText, type IngestRow, type IngestWrite } from "@/lib/ingest";
import { assertPublicIngestUrl, ingestKey, sealSecret } from "@/lib/ingest-net";

export type IngestResult = { ok: true } | { ok: false; error: string };

function constraintOf(error: unknown): string | null {
  let current: unknown = error;
  for (let i = 0; i < 5 && current && typeof current === "object"; i++) {
    if ("constraint" in current && typeof current.constraint === "string") {
      return current.constraint;
    }
    if ("code" in current && (current as { code: unknown }).code === "23505") {
      const message = "message" in current ? String(current.message) : "";
      return message;
    }
    current = "cause" in current ? (current as { cause: unknown }).cause : null;
  }
  return null;
}

function isUnique(error: unknown): boolean {
  return constraintOf(error) !== null && uniqueCode(error);
}

function uniqueCode(error: unknown): boolean {
  let current: unknown = error;
  for (let i = 0; i < 5 && current && typeof current === "object"; i++) {
    if ("code" in current && (current as { code: unknown }).code === "23505") return true;
    current = "cause" in current ? (current as { cause: unknown }).cause : null;
  }
  return false;
}

async function publisherId(name: string): Promise<number> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const [found] = await db
      .select({ id: publishersTable.id, deletedAt: publishersTable.deletedAt })
      .from(publishersTable)
      .where(sql`lower(${publishersTable.name}) = ${name.toLowerCase()}`)
      .limit(1);
    if (found) {
      if (found.deletedAt) {
        await db
          .update(publishersTable)
          .set({ deletedAt: null, name, updatedAt: new Date() })
          .where(eq(publishersTable.id, found.id));
      }
      return found.id;
    }
    try {
      const [created] = await db
        .insert(publishersTable)
        .values({ name })
        .returning({ id: publishersTable.id });
      return created.id;
    } catch (error) {
      if (!isUnique(error) || attempt === 1) throw error;
    }
  }
  throw new Error("Publisher could not be saved.");
}

function sealedAuth(
  input: IngestWrite,
  existing: string | null,
): { ok: true; value: string | null } | { ok: false; error: string } {
  if (input.authSecret) {
    const key = ingestKey();
    if (!key) {
      return { ok: false, error: "Set INGEST_SECRET_KEY on the server before saving an API secret." };
    }
    return { ok: true, value: sealSecret(input.authSecret, key) };
  }
  if (input.clearAuthSecret) return { ok: true, value: null };
  return { ok: true, value: existing };
}

export async function listIngest(): Promise<IngestRow[]> {
  const rows = await db
    .select({
      id: ingestTable.id,
      name: ingestTable.name,
      url: ingestTable.url,
      type: ingestTable.type,
      language: ingestTable.language,
      status: ingestTable.status,
      interval: ingestTable.interval,
      lastRunAt: ingestTable.lastRunAt,
      nextRunAt: ingestTable.nextRunAt,
      headers: ingestTable.headers,
      pagination: ingestTable.pagination,
      fieldMapping: ingestTable.fieldMapping,
      extractionRules: ingestTable.extractionRules,
      hasAuthSecret: sql<boolean>`${ingestTable.authSecret} is not null`,
      publisher: publishersTable.name,
      articlesTotal: sql<number>`count(${archiveTable.id})::int`,
    })
    .from(ingestTable)
    .innerJoin(publishersTable, eq(ingestTable.publisherId, publishersTable.id))
    .leftJoin(
      archiveTable,
      and(eq(archiveTable.ingestId, ingestTable.id), isNull(archiveTable.deletedAt)),
    )
    .where(isNull(ingestTable.deletedAt))
    .groupBy(ingestTable.id, publishersTable.name)
    .orderBy(ingestTable.name);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    url: row.url,
    type: row.type,
    publisher: row.publisher,
    language: row.language ?? "",
    status: row.status,
    intervalMinutes: Math.max(1, Math.round(row.interval / 60)),
    lastRunAt: row.lastRunAt?.toISOString() ?? null,
    nextRunAt: row.nextRunAt?.toISOString() ?? null,
    articlesTotal: Number(row.articlesTotal),
    hasAuthSecret: Boolean(row.hasAuthSecret),
    headers: jsonText(row.headers),
    pagination: jsonText(row.pagination),
    fieldMapping: jsonText(row.fieldMapping),
    extractionRules: jsonText(row.extractionRules),
  }));
}

export async function saveIngest(input: IngestWrite): Promise<IngestResult> {
  const urlError = await assertPublicIngestUrl(input.url);
  if (urlError) return { ok: false, error: urlError };

  const now = new Date();

  try {
    const publisher = await publisherId(input.publisher);
    if (input.id === null) {
      const auth = sealedAuth(input, null);
      if (!auth.ok) return auth;
      await db.insert(ingestTable).values({
        publisherId: publisher,
        name: input.name,
        url: input.url,
        type: input.type,
        language: input.language,
        status: input.status,
        interval: input.intervalSeconds,
        authSecret: auth.value,
        headers: input.headers,
        pagination: input.pagination,
        fieldMapping: input.fieldMapping,
        extractionRules: input.extractionRules,
        nextRunAt: input.status === "active" ? now : null,
      });
      return { ok: true };
    }

    const [existing] = await db
      .select({
        id: ingestTable.id,
        status: ingestTable.status,
        authSecret: ingestTable.authSecret,
      })
      .from(ingestTable)
      .where(and(eq(ingestTable.id, input.id), isNull(ingestTable.deletedAt)))
      .limit(1);
    if (!existing) return { ok: false, error: "That source is no longer available." };

    const auth = sealedAuth(input, existing.authSecret);
    if (!auth.ok) return auth;

    await db
      .update(ingestTable)
      .set({
        publisherId: publisher,
        name: input.name,
        url: input.url,
        type: input.type,
        language: input.language,
        status: input.status,
        interval: input.intervalSeconds,
        authSecret: auth.value,
        headers: input.headers,
        pagination: input.pagination,
        fieldMapping: input.fieldMapping,
        extractionRules: input.extractionRules,
        nextRunAt: input.status === "active" && existing.status !== "active" ? now : undefined,
        updatedAt: now,
      })
      .where(eq(ingestTable.id, existing.id));
    return { ok: true };
  } catch (error) {
    const constraint = constraintOf(error) ?? "";
    if (isUnique(error) && constraint.includes("url")) {
      return { ok: false, error: "A source with that URL already exists." };
    }
    console.error("ingest save failed");
    return { ok: false, error: "The source could not be saved." };
  }
}

export async function deleteIngest(id: number): Promise<IngestResult> {
  const [row] = await db
    .update(ingestTable)
    .set({ deletedAt: new Date(), status: "inactive", updatedAt: new Date() })
    .where(and(eq(ingestTable.id, id), isNull(ingestTable.deletedAt)))
    .returning({ id: ingestTable.id });
  if (!row) return { ok: false, error: "That source is no longer available." };
  return { ok: true };
}
