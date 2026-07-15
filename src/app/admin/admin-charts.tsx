"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lazy-loaded admin charts bundle.
 *
 * Recharts adds ~150KB to the JS bundle. Splitting it into a separate chunk
 * that only loads when the admin dashboard renders keeps the public site lean.
 */
const AdminChartsLazy = dynamic(
  () => import("./admin-charts-inner").then((m) => m.AdminChartsInner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />,
  }
);

export type AdminChartsProps = {
  revenueData: Array<{ month: string; revenue: number; target: number }>;
  programData: Array<{ name: string; value: number; color: string }>;
  leadSourceData: Array<{ source: string; count: number }>;
};

export function AdminCharts(props: AdminChartsProps) {
  return <AdminChartsLazy {...props} />;
}
