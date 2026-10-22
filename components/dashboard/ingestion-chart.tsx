"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import type { DailyIngestionPoint } from "@/lib/types";
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
  new: { label: "New", color: "var(--chart-1)" },
  revised: { label: "Revised", color: "var(--chart-2)" },
  duplicate: { label: "Duplicate", color: "var(--chart-3)" },
  failed: { label: "Failed", color: "var(--chart-4)" },
} satisfies ChartConfig;

type IngestionChartProps = {
  data: DailyIngestionPoint[];
};

export function IngestionChart({ data }: IngestionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily ingestion</CardTitle>
        <CardDescription>
          Articles by outcome over the last 14 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="new"
              stackId="a"
              fill="var(--color-new)"
              stroke="var(--color-new)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="revised"
              stackId="a"
              fill="var(--color-revised)"
              stroke="var(--color-revised)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="duplicate"
              stackId="a"
              fill="var(--color-duplicate)"
              stroke="var(--color-duplicate)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="failed"
              stackId="a"
              fill="var(--color-failed)"
              stroke="var(--color-failed)"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
