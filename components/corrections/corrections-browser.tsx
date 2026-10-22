"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CorrectionKindBadge, EditorialStateBadge } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDraftRecords } from "@/components/corrections/corrections-store";
import { formatDateTime } from "@/lib/format";
import type { CorrectionFlag, CorrectionRecord } from "@/lib/types";

type CorrectionsBrowserProps = {
  flags: CorrectionFlag[];
  records: CorrectionRecord[];
};

export function CorrectionsBrowser({ flags, records }: CorrectionsBrowserProps) {
  const draftRecords = useDraftRecords();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "records" ? "records" : "flags";
  const savedIds = new Set(records.map((record) => record.id));

  return (
    <Tabs defaultValue={defaultTab} className="gap-4">
      <TabsList>
        <TabsTrigger value="flags">Needs review ({flags.length})</TabsTrigger>
        <TabsTrigger value="records">
          Records ({records.length + draftRecords.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="flags">
        {flags.length === 0 ? (
          <p className="rounded-lg border px-4 py-6 text-sm text-muted-foreground">
            No source changes are waiting for review.
          </p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Source changed</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead className="w-0" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="max-w-xs font-medium">
                      {flag.articleTitle}
                    </TableCell>
                    <TableCell>
                      <EditorialStateBadge state={flag.state} />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <Link
                        href={`/archive/${flag.sourceSlug}`}
                        className="text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {flag.sourceTitle}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(flag.detectedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link
                            href={`/corrections/new?article=${flag.articleSlug}&source=${flag.sourceSlug}`}
                          />
                        }
                      >
                        Open correction
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="records">
        {records.length + draftRecords.length === 0 ? (
          <p className="rounded-lg border px-4 py-6 text-sm text-muted-foreground">
            No corrections recorded yet.
          </p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Editor</TableHead>
                  <TableHead>Recorded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...draftRecords, ...records].map((record) => {
                  const isSaved = savedIds.has(record.id);
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="max-w-xs font-medium">
                        {isSaved ? (
                          <Link
                            href={`/corrections/${record.id}`}
                            className="hover:underline"
                          >
                            {record.articleTitle}
                          </Link>
                        ) : (
                          <span>
                            {record.articleTitle}
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              Unsaved (this session)
                            </span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <CorrectionKindBadge kind={record.kind} />
                      </TableCell>
                      <TableCell className="max-w-sm text-muted-foreground">
                        {record.reason}
                      </TableCell>
                      <TableCell>{record.editor}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(record.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
