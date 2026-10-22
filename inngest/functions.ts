import {
  cleanRevision,
  extractRevision,
  embedRevision,
  linkExtraction,
  setArchiveStatus,
  suggestEntityImage,
} from "@/lib/archive-enrich";
import { claimDueIngest } from "@/lib/db/functions/ingest/ingest.claim";
import {
  closeIngestHistory,
  discoverItems,
  ingestNewItems,
  listArchiveUrls,
  loadActiveIngest,
  openIngestHistory,
  planNewItems,
} from "@/lib/ingest-run";
import { inngest } from "./client";

export const dispatchIngest = inngest.createFunction(
  { id: "dispatch-ingest", triggers: [{ cron: "* * * * *" }] },
  async ({ step }) => {
    const due = await step.run("claim-due", () => claimDueIngest());
    if (due.length === 0) return { claimed: 0 };
    await step.sendEvent(
      "enqueue",
      due.map((row) => ({
        name: "app/ingest.due",
        data: { ingestId: row.id },
      })),
    );
    return { claimed: due.length };
  },
);

export const processIngest = inngest.createFunction(
  {
    id: "process-ingest",
    triggers: [{ event: "app/ingest.due" }],
    concurrency: [{ key: "event.data.ingestId", limit: 1 }],
  },
  async ({ event, step }) => {
    const ingestId = Number(event.data.ingestId);
    if (!Number.isInteger(ingestId) || ingestId < 1) return { skipped: true };

    const started = await step.run("start-run", async () => {
      const source = await loadActiveIngest(ingestId);
      if (!source) return { skipped: true as const, historyId: 0 };
      return {
        skipped: false as const,
        historyId: await openIngestHistory(ingestId),
      };
    });
    if (started.skipped) return { skipped: true };

    try {
      const discovered = await step.run("discover", () =>
        discoverItems(ingestId),
      );
      const planned = await step.run("plan-items", async () => {
        const existing = await listArchiveUrls(ingestId);
        return planNewItems(discovered, existing);
      });
      const ingested = await step.run("ingest-items", () =>
        ingestNewItems(ingestId, planned.fresh),
      );
      const counts = {
        newCount: ingested.archiveIds.length,
        duplicateCount: planned.duplicateCount + ingested.duplicateCount,
        failedCount: ingested.failedCount,
      };
      await step.run("finish-run", () =>
        closeIngestHistory(started.historyId, counts),
      );
      if (ingested.archiveIds.length > 0) {
        await step.sendEvent(
          "enqueue-enrich",
          ingested.archiveIds.map((archiveId) => ({
            name: "app/archive.enrich",
            data: { archiveId },
          })),
        );
      }
      return counts;
    } catch (error) {
      await step.run("fail-run", () =>
        closeIngestHistory(started.historyId, {
          newCount: 0,
          duplicateCount: 0,
          failedCount: 0,
          error: error instanceof Error ? error.message : "Ingest failed.",
        }),
      );
      throw error;
    }
  },
);

export const processArchiveEnrich = inngest.createFunction(
  {
    id: "process-archive-enrich",
    triggers: [{ event: "app/archive.enrich" }],
    concurrency: [{ key: "event.data.archiveId", limit: 1 }],
  },
  async ({ event, step }) => {
    const archiveId = Number(event.data.archiveId);
    if (!Number.isInteger(archiveId) || archiveId < 1) return { skipped: true };

    try {
      await step.run("clean", () => cleanRevision(archiveId));
      await step.run("embed", () => embedRevision(archiveId));
      const extracted = await step.run("extract", () =>
        extractRevision(archiveId),
      );
      const entityIds = extracted
        ? await step.run("link", () => linkExtraction(archiveId, extracted))
        : [];
      if (extracted) {
        await step.run("image", () =>
          suggestEntityImage(archiveId, entityIds, extracted.crop),
        );
      }
      await step.run("ready", () => setArchiveStatus(archiveId, "ready"));
      return { archiveId, status: "ready" as const };
    } catch (error) {
      await step.run("failed", () => setArchiveStatus(archiveId, "failed"));
      throw error;
    }
  },
);
