"use server";

import { revalidatePath } from "next/cache";
import { claimAllIngest } from "@/lib/db/functions/ingest/ingest.claim";
import { deleteIngest, saveIngest, type IngestResult } from "@/lib/ingest-db";
import { parseIngestForm } from "@/lib/ingest";
import { inngest } from "@/inngest/client";

export type SaveState =
  | { ok: true }
  | { ok: false; error: string; fields: Record<string, string> };

function formFields(form: FormData): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (key === "authSecret" || typeof value !== "string") continue;
    fields[key] = value;
  }
  return fields;
}

async function done(result: IngestResult, form: FormData): Promise<SaveState> {
  if (result.ok) {
    revalidatePath("/ingest");
    return result;
  }
  return { ...result, fields: formFields(form) };
}

export async function saveIngestAction(
  _prev: SaveState | null,
  form: FormData,
): Promise<SaveState> {
  const parsed = parseIngestForm(form);
  if (!parsed.ok)
    return { ok: false, error: parsed.error, fields: formFields(form) };
  return done(await saveIngest(parsed.value), form);
}

export async function crawlAllAction(): Promise<
  { ok: true; claimed: number } | { ok: false; error: string }
> {
  try {
    const claimed = await claimAllIngest();
    if (claimed.length > 0) {
      await inngest.send(
        claimed.map((row) => ({
          name: "app/ingest.due",
          data: { ingestId: row.id },
        })),
      );
    }
    revalidatePath("/ingest");
    return { ok: true, claimed: claimed.length };
  } catch (error) {
    console.error("crawl all failed", error instanceof Error ? error.message : "unknown");
    return { ok: false, error: "Could not queue crawls. Try again." };
  }
}

export async function deleteIngestAction(
  _prev: IngestResult | null,
  form: FormData,
): Promise<IngestResult> {
  const id = Number(form.get("id"));
  if (!Number.isInteger(id) || id < 1) {
    return { ok: false, error: "That source is no longer available." };
  }
  return done(await deleteIngest(id), form);
}
