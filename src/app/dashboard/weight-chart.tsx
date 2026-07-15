"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lazy-loaded weight-progress chart.
 *
 * Recharts adds ~150KB to the JS bundle. By splitting it into a separate
 * chunk that only loads when the dashboard renders, we keep the initial
 * bundle lean (good for landing-page visitors who never log in).
 */
const WeightChartLazy = dynamic(
  () => import("./weight-chart-inner").then((m) => m.WeightChartInner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[250px] w-full rounded-xl" />,
  }
);

export type WeightChartProps = {
  data: Array<{ date: string; weight: number | null }>;
  targetWeight?: number;
};

export function WeightChart(props: WeightChartProps) {
  return <WeightChartLazy {...props} />;
}
