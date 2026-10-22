import { IngestBrowser } from "@/components/ingest/ingest-browser";
import { listIngest } from "@/lib/ingest-db";

export const instant = false;

export default async function IngestPage() {
  let sources: Awaited<ReturnType<typeof listIngest>> = [];
  let loadError: string | null = null;
  try {
    sources = await listIngest();
  } catch (error) {
    console.error("ingest list failed", error instanceof Error ? error.message : "unknown");
    loadError = "Sources could not be loaded. Check the database connection.";
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {loadError ? (
        <>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ingest</h1>
            <p className="text-muted-foreground">Sources and fetch schedules.</p>
          </div>
          <p role="alert" className="text-sm text-destructive">
            {loadError}
          </p>
        </>
      ) : (
        <IngestBrowser sources={sources} />
      )}
    </div>
  );
}
