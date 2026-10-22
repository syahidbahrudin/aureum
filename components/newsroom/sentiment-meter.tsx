"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  sensitivity: { label: "Sensitivity", color: "var(--foreground)" },
} satisfies ChartConfig;

export function SentimentMeter({
  score,
  sentiment,
}: {
  score: number;
  sentiment: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-56">
      <ChartContainer
        config={chartConfig}
        initialDimension={{ width: 224, height: 112 }}
        className="aspect-[2/1] h-28 w-full"
        aria-label={`Sensitivity ${score} of 100, ${sentiment} sentiment`}
      >
        <RadialBarChart
          data={[{ sensitivity: score, fill: "var(--color-sensitivity)" }]}
          startAngle={180}
          endAngle={0}
          innerRadius="78%"
          outerRadius="100%"
          cx="50%"
          cy="100%"
          barSize={10}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="sensitivity"
            background={{ fill: "var(--muted)" }}
            cornerRadius={8}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ChartContainer>
      <p className="absolute inset-x-0 bottom-1 text-center">
        <span className="block text-lg leading-none font-medium tabular-nums">
          {score}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {sentiment}
        </span>
      </p>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}
