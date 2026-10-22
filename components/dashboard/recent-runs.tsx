import type { IngestRun } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { ingestRunStatusLabel } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function runStatusVariant(
  status: IngestRun["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "success":
      return "default";
    case "partial":
      return "secondary";
    case "failed":
      return "destructive";
    case "running":
      return "outline";
  }
}

type RecentRunsProps = {
  runs: IngestRun[];
};

export function RecentRuns({ runs }: RecentRunsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent ingest runs</CardTitle>
        <CardDescription>Latest fetch results across all sources</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">New</TableHead>
              <TableHead className="text-right">Revised</TableHead>
              <TableHead className="text-right">Dupes</TableHead>
              <TableHead className="text-right">Failed</TableHead>
              <TableHead className="pr-6 text-right">Started</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="pl-6 font-medium">
                  {run.sourceName}
                </TableCell>
                <TableCell>
                  <Badge variant={runStatusVariant(run.status)}>
                    {ingestRunStatusLabel(run.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {run.newCount}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {run.revisedCount}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {run.duplicateCount}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {run.failedCount}
                </TableCell>
                <TableCell className="pr-6 text-right text-muted-foreground">
                  {formatDateTime(run.startedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
