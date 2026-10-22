import { TrendingDown, TrendingUp } from "lucide-react";
import type { KpiMetric } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type KpiCardsProps = {
  metrics: KpiMetric[];
};

function formatValue(metric: KpiMetric): string {
  return formatNumber(metric.value);
}

export function KpiCards({ metrics }: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {metrics.map((metric) => {
        const positive = metric.delta >= 0;
        const deltaText = metric.deltaIsPercent
          ? `${positive ? "+" : ""}${metric.delta}%`
          : `${positive ? "+" : ""}${formatNumber(metric.delta)}`;

        return (
          <Card key={metric.id} className="gap-0 py-4">
            <CardHeader className="gap-1 px-4 pb-2">
              <CardDescription className="text-xs">
                {metric.label}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {formatValue(metric)}
              </CardTitle>
            </CardHeader>
            <div className="flex items-center gap-1.5 px-4 pt-0">
              <Badge
                variant="secondary"
                className="gap-0.5 font-normal tabular-nums"
              >
                {positive ? (
                  <TrendingUp className="size-3" aria-hidden />
                ) : (
                  <TrendingDown className="size-3" aria-hidden />
                )}
                {deltaText}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {metric.deltaLabel}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
