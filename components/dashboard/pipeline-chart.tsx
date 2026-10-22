"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { PipelineCount } from "@/lib/types";
import { editorialStateLabel } from "@/lib/labels";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  count: { label: "Articles", color: "var(--chart-2)" },
} satisfies ChartConfig;

type PipelineChartProps = {
  data: PipelineCount[];
};

export function PipelineChart({ data }: PipelineChartProps) {
  const chartData = data.map((row) => ({
    state: editorialStateLabel(row.state),
    count: row.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Editorial pipeline</CardTitle>
        <CardDescription>Articles by workflow state</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 16 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="state"
              type="category"
              tickLine={false}
              axisLine={false}
              width={88}
              tickMargin={4}
            />
            <XAxis type="number" hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
