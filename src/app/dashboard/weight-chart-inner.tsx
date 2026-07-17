"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";

export type WeightChartInnerProps = {
  data: Array<{ date: string; weight: number | null }>;
  targetWeight?: number;
};

export function WeightChartInner({ data, targetWeight }: WeightChartInnerProps) {
  if (data.length < 2) return null;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 233)" vertical={false} />
        <XAxis dataKey="date" stroke="oklch(0.45 0.03 233)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="oklch(0.45 0.03 233)" fontSize={11} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
        <Tooltip contentStyle={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.92 0.01 233)", borderRadius: "0.75rem", fontSize: "0.75rem" }} />
        {targetWeight && targetWeight > 0 && (
          <ReferenceLine y={targetWeight} stroke="oklch(0.55 0.18 255)" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "oklch(0.55 0.18 255)" }} />
        )}
        <Line type="monotone" dataKey="weight" stroke="oklch(0.699 0.134 232.8)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.699 0.134 232.8)" }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
