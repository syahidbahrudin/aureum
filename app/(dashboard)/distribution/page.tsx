import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { mockDistributionItems } from "@/lib/mock/distribution";

export default function DistributionPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Distribution</h1>
        <p className="text-muted-foreground">
          Channel copy for published and approved articles. Copy and export
          only — direct publishing is not connected.
        </p>
      </div>
      {mockDistributionItems.length === 0 ? (
        <p className="rounded-lg border px-4 py-6 text-sm text-muted-foreground">
          No article is published or approved yet. Approve an article in
          Editorial to draft its channel copy here.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead className="text-right">Ready</TableHead>
                <TableHead className="text-right">Needs review</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDistributionItems.map((item) => {
                const ready = item.versions.filter(
                  (version) =>
                    version.state === "ready" || version.state === "exported",
                ).length;
                const needsReview = item.versions.filter(
                  (version) => version.state === "needs_review",
                ).length;
                return (
                  <TableRow key={item.articleSlug}>
                    <TableCell className="max-w-sm font-medium">
                      <Link
                        href={`/distribution/${item.articleSlug}`}
                        className="hover:underline"
                      >
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {ready}/{item.versions.length}
                    </TableCell>
                    <TableCell className="text-right">
                      {needsReview > 0 ? (
                        <Badge variant="destructive">{needsReview}</Badge>
                      ) : (
                        <span className="tabular-nums text-muted-foreground">
                          0
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(item.updatedAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
