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
      <div className="flex items-center justify-center h-48 text-neutral-400 text-xs font-mono">
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
          <XAxis type="number" stroke="#999999" fontSize={11} tickLine={false} axisLine={{ stroke: "#E5E5E5" }} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#000000"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#E5E5E5" }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E5E5",
              borderRadius: "16px",
              fontSize: "12px",
              color: "#000000",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
            formatter={(value: any, name: any, item: any) => [
              `SHAP: ${Number(value).toFixed(4)} (Sensor: ${item.payload.value}, Base: ${item.payload.baseline})`,
              "Impact",
            ]}
          />
          <ReferenceLine x={0} stroke="#CCCCCC" strokeWidth={1.5} />
          <Bar dataKey="shap" radius={[0, 6, 6, 0]}>
            {displayData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.shap >= 0 ? "#EF4444" : "#76FB91"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
