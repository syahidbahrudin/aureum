import { GeneratedVsPublished } from "@/components/dashboard/generated-vs-published";
import { IngestionChart } from "@/components/dashboard/ingestion-chart";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { PublishersBar } from "@/components/dashboard/publishers-bar";
import { RecentRuns } from "@/components/dashboard/recent-runs";
import { StatusDonut } from "@/components/dashboard/status-donut";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import {
  mockAiSuggestionStats,
  mockDailyIngestion,
  mockGeneratedPublished,
  mockKpis,
  mockPipelineCounts,
  mockPublisherVolumes,
  mockRecentRuns,
  mockStatusBreakdown,
} from "@/lib/mock/dashboard";

export default function DashboardPage() {
  const ai = mockAiSuggestionStats;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Ingestion volume, editorial output, and processing health at a glance.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 self-start">
          Mock data — not connected to live services
        </Badge>
      </div>

      <KpiCards metrics={mockKpis} />

      <div className="grid gap-4 lg:grid-cols-2">
        <IngestionChart data={mockDailyIngestion} />
        <PipelineChart data={mockPipelineCounts} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatusDonut data={mockStatusBreakdown} />
        <div className="lg:col-span-2">
          <GeneratedVsPublished data={mockGeneratedPublished} />
        </div>
      </div>

      <PublishersBar data={mockPublisherVolumes} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            AI suggestions vs editor-verified
          </CardTitle>
          <CardDescription>
            Entity and topic links awaiting review versus verified by editors.
            Suggestions are not treated as facts until accepted.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              {formatNumber(ai.entitySuggestionsPending)}
            </p>
            <p className="text-sm text-muted-foreground">
              Entity suggestions pending
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              {formatNumber(ai.topicSuggestionsPending)}
            </p>
            <p className="text-sm text-muted-foreground">
              Topic suggestions pending
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              {formatNumber(ai.editorVerifiedLinks)}
            </p>
            <p className="text-sm text-muted-foreground">Editor-verified links</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              {formatNumber(ai.aiSuggestedLinks)}
            </p>
            <p className="text-sm text-muted-foreground">
              AI-suggested links (unverified)
            </p>
          </div>
        </CardContent>
      </Card>

      <RecentRuns runs={mockRecentRuns} />
    </div>
  );
}
