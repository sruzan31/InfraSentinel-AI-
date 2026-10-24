"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";

interface ShapContribution {
  feature: string;
  value: number;
  baseline: number;
  shap_value: number;
  impact: string;
  description: string;
}

interface ShapBarChartProps {
  contributions: ShapContribution[];
  height?: number;
}

export function ShapBarChart({ contributions, height = 300 }: ShapBarChartProps) {
  if (!contributions || contributions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-xs font-mono">
        No SHAP attribution records available. Ingest telemetry to compute feature impact.
      </div>
    );
  }

  // Display top 7 features
  const displayData = contributions.slice(0, 7).map((c) => ({
    name: c.feature.replace("[K]", "").replace("[rpm]", "").replace("[Nm]", "").replace("[min]", "").trim(),
    shap: c.shap_value,
    impact: c.impact,
    value: c.value,
    baseline: c.baseline,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={displayData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 70, bottom: 5 }}
        >
          <XAxis type="number" stroke="#64748B" fontSize={10} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0B1220",
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: "0.75rem",
              fontSize: "12px",
            }}
            formatter={(value: any, name: any, item: any) => [
              `SHAP: ${Number(value).toFixed(4)} (Sensor Value: ${item.payload.value}, Baseline: ${item.payload.baseline})`,
              "Impact",
            ]}
          />
          <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} />
          <Bar dataKey="shap" radius={[0, 4, 4, 0]}>
            {displayData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.shap >= 0 ? "#EF4444" : "#10B981"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
