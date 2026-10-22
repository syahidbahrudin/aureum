"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import type { AudienceMetricPoint } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  views: { label: "Page views", color: "var(--chart-1)" },
  engagedSessions: {
    label: "Engaged sessions",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type AudienceViewsChartProps = {
  data: AudienceMetricPoint[];
};

export function AudienceViewsChart({ data }: AudienceViewsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Audience traffic</CardTitle>
        <CardDescription>
          Measured page views and engaged sessions (mock analytics integration)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="views"
              stroke="var(--color-views)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="engagedSessions"
              stroke="var(--color-engagedSessions)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
