"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { PublisherVolume } from "@/lib/types";
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
  count: { label: "Articles", color: "var(--chart-1)" },
} satisfies ChartConfig;

type PublishersBarProps = {
  data: PublisherVolume[];
};

export function PublishersBar({ data }: PublishersBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top publishers</CardTitle>
        <CardDescription>Source articles in archive by publisher</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="publisher"
              type="category"
              tickLine={false}
              axisLine={false}
              width={100}
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
