"use client";

import { useActionState, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  crawlAllAction,
  deleteIngestAction,
  saveIngestAction,
} from "@/app/(dashboard)/ingest/actions";
import { formatDateTime, formatNumber } from "@/lib/format";
import {
  sourceStatuses,
  sourceTypes,
  type IngestRow,
  type IngestStatus,
} from "@/lib/ingest";

const controlClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function when(iso: string | null) {
  return iso ? formatDateTime(iso) : "Not yet";
}

const typeLabel: Record<IngestRow["type"], string> = {
  rss: "RSS",
  website: "Website",
  api: "API",
};

const statusLabel: Record<IngestStatus, string> = {
  active: "Active",
  paused: "Paused",
  inactive: "Inactive",
};

function IngestStatusBadge({ status }: { status: IngestStatus }) {
  const variant =
    status === "active"
      ? "default"
      : status === "paused"
        ? "secondary"
        : "outline";
  return <Badge variant={variant}>{statusLabel[status]}</Badge>;
}

export function IngestBrowser({ sources }: { sources: IngestRow[] }) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ingest</h1>
          <p className="text-muted-foreground">Sources and fetch schedules.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CrawlAll />
          <SourceDialog />
        </div>
      </div>
      {sources.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sources yet. Add a feed, site, or API to start fetching.
        </p>
      ) : (
        <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sources.map((source) => (
            <li key={source.id}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{source.name}</CardTitle>
                  <CardDescription>{source.publisher}</CardDescription>
                  <CardAction>
                    <IngestStatusBadge status={source.status} />
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{typeLabel[source.type]}</Badge>
                    <span className="min-w-0 truncate text-xs text-muted-foreground">
                      {source.url}
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Interval</dt>
                      <dd className="tabular-nums">
                        {source.intervalMinutes}m
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Articles</dt>
                      <dd className="tabular-nums">
                        {formatNumber(source.articlesTotal)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Last run</dt>
                      <dd>{when(source.lastRunAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Next run</dt>
                      <dd>{when(source.nextRunAt)}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap gap-2">
                    <SourceDialog source={source} />
                    <DeleteSource source={source} />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function CrawlAll() {
  const [state, action, pending] = useActionState(crawlAllAction, null);
  return (
    <form action={action} className="flex items-center gap-2">
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Queuing…" : "Crawl all"}
      </Button>
      {state ? (
        <p
          className={state.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}
          role={state.ok ? "status" : "alert"}
        >
          {state.ok
            ? state.claimed === 0
              ? "No active sources."
              : `Queued ${state.claimed}.`
            : state.error}
        </p>
      ) : null}
    </form>
  );
}

function SourceDialog({ source }: { source?: IngestRow }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant={source ? "outline" : "default"} />
        }
      >
        {source ? "Edit" : "Add source"}
      </DialogTrigger>
      <DialogContent className="max-h-[min(40rem,calc(100%-2rem))] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{source ? "Edit source" : "Add source"}</DialogTitle>
          <DialogDescription>
            RSS, website, or API. Fetching starts on the next scheduled run.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <SourceForm source={source} onSaved={() => setOpen(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SourceForm({
  source,
  onSaved,
}: {
  source?: IngestRow;
  onSaved: () => void;
}) {
  const [initial] = useState(source);
  const [formKey, setFormKey] = useState(0);
  const [state, action, pending] = useActionState(saveIngestAction, null);
  useEffect(() => {
    if (state?.ok) onSaved();
    if (state?.ok === false) setFormKey((key) => key + 1);
  }, [state, onSaved]);

  const fields = state?.ok === false ? state.fields : null;
  const value = (name: string, fallback = "") => fields?.[name] ?? fallback;

  return (
    <form key={formKey} action={action} className="grid gap-3">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <label className="grid gap-1.5 text-sm">
        Name
        <Input
          name="name"
          required
          maxLength={255}
          defaultValue={value("name", initial?.name)}
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        Publisher
        <Input
          name="publisher"
          required
          maxLength={255}
          defaultValue={value("publisher", initial?.publisher)}
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        URL
        <Input
          name="url"
          type="url"
          required
          defaultValue={value("url", initial?.url)}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          Type
          <select
            name="type"
            required
            defaultValue={value("type", initial?.type ?? "rss")}
            className={controlClass}
          >
            {sourceTypes.map((type) => (
              <option key={type} value={type}>
                {typeLabel[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          Status
          <select
            name="status"
            required
            defaultValue={value("status", initial?.status ?? "active")}
            className={controlClass}
          >
            {sourceStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          Language
          <Input
            name="language"
            maxLength={32}
            defaultValue={value("language", initial?.language)}
            placeholder="en"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          Interval (minutes)
          <Input
            name="intervalMinutes"
            type="number"
            required
            min={1}
            max={10080}
            defaultValue={value(
              "intervalMinutes",
              String(initial?.intervalMinutes ?? 60),
            )}
          />
        </label>
      </div>
      <details className="rounded-lg border px-3 py-2">
        <summary className="cursor-pointer text-sm font-medium">
          API and extraction
        </summary>
        <div className="mt-3 grid gap-3">
          <label className="grid gap-1.5 text-sm">
            Auth secret
            <Input
              name="authSecret"
              type="password"
              autoComplete="new-password"
              placeholder={
                initial?.hasAuthSecret
                  ? "Stored. Leave blank to keep it."
                  : "Optional"
              }
            />
          </label>
          {initial?.hasAuthSecret ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="clearAuthSecret" />
              Clear stored secret
            </label>
          ) : null}
          <JsonField
            name="headers"
            label="Headers"
            defaultValue={value("headers", initial?.headers)}
          />
          <JsonField
            name="pagination"
            label="Pagination"
            defaultValue={value("pagination", initial?.pagination)}
          />
          <JsonField
            name="fieldMapping"
            label="Field mapping"
            defaultValue={value("fieldMapping", initial?.fieldMapping)}
          />
          <JsonField
            name="extractionRules"
            label="Extraction rules"
            defaultValue={value("extractionRules", initial?.extractionRules)}
          />
        </div>
      </details>
      {state?.ok === false ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function JsonField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      {label}
      <Textarea
        name={name}
        defaultValue={defaultValue}
        spellCheck={false}
        placeholder="{}"
        className="font-mono text-xs"
      />
    </label>
  );
}

function DeleteSource({ source }: { source: IngestRow }) {
  const [state, action, pending] = useActionState(deleteIngestAction, null);
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button type="button" variant="destructive" />}
      >
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {source.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This stops future fetches. Archived articles stay.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state?.ok === false ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={action}>
            <input type="hidden" name="id" value={source.id} />
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
