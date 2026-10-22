"use client";

import { Cell, Pie, PieChart } from "recharts";
import type { StatusBreakdown } from "@/lib/types";
import { processingStatusLabel } from "@/lib/labels";
import { formatNumber } from "@/lib/format";
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
  ready: { label: "Ready", color: "var(--chart-1)" },
  processing: { label: "Processing", color: "var(--chart-2)" },
  pending: { label: "Pending", color: "var(--chart-3)" },
  failed: { label: "Failed", color: "var(--chart-4)" },
} satisfies ChartConfig;

const sliceColors: Record<string, string> = {
  ready: "var(--color-ready)",
  processing: "var(--color-processing)",
  pending: "var(--color-pending)",
  failed: "var(--color-failed)",
};

type StatusDonutProps = {
  data: StatusBreakdown[];
};

export function StatusDonut({ data }: StatusDonutProps) {
  const chartData = data.map((row) => ({
    status: row.status,
    name: processingStatusLabel(row.status),
    count: row.count,
    fill: sliceColors[row.status],
  }));

  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Archive processing</CardTitle>
        <CardDescription>
          {formatNumber(total)} source articles by status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-[280px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              innerRadius={60}
              outerRadius={96}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
