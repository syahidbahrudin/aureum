import { AudienceViewsChart } from "@/components/analytics/audience-views-chart";
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
import { formatNumber } from "@/lib/format";
import {
  mockAudienceSeries,
  mockTopArticlesByViews,
  mockTrafficSources,
} from "@/lib/mock/analytics";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Audience performance when an analytics system is connected. Unmeasured
            metrics are labeled clearly.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 self-start">
          Sample / estimated data
        </Badge>
      </div>

      <AudienceViewsChart data={mockAudienceSeries} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic sources</CardTitle>
            <CardDescription>Share of sessions by channel</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Source</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                  <TableHead className="pr-6">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTrafficSources.map((row) => (
                  <TableRow key={row.source}>
                    <TableCell className="pl-6">{row.source}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.share}%
                    </TableCell>
                    <TableCell className="pr-6">
                      <Badge variant={row.measured ? "default" : "secondary"}>
                        {row.measured ? "Measured" : "Estimated"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top articles by views</CardTitle>
            <CardDescription>Last 30 days (where measured)</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Article</TableHead>
                  <TableHead className="pr-6 text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTopArticlesByViews.map((row) => (
                  <TableRow key={row.title}>
                    <TableCell className="max-w-xs pl-6 font-medium">
                      {row.title}
                    </TableCell>
                    <TableCell className="pr-6 text-right tabular-nums">
                      {row.views !== null ? (
                        formatNumber(row.views)
                      ) : (
                        <span className="text-muted-foreground">No data</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
