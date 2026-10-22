"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import type { GeneratedPublishedPoint } from "@/lib/types";
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
  generated: { label: "Drafts generated", color: "var(--chart-2)" },
  published: { label: "Published", color: "var(--chart-1)" },
} satisfies ChartConfig;

type GeneratedVsPublishedProps = {
  data: GeneratedPublishedPoint[];
};

export function GeneratedVsPublished({ data }: GeneratedVsPublishedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Generated vs published</CardTitle>
        <CardDescription>
          AI-assisted drafts created and articles published per day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
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
              dataKey="generated"
              stroke="var(--color-generated)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="published"
              stroke="var(--color-published)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
