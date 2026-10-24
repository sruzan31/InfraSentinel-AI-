"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface TelemetryPoint {
  timestamp: string;
  air_temp_k?: number;
  process_temp_k?: number;
  rotational_speed_rpm?: number;
  torque_nm?: number;
  vibration_mms?: number;
  pressure_bar?: number;
  temp_diff_k?: number;
  [key: string]: any;
}

interface TelemetryChartProps {
  data: TelemetryPoint[];
  metricType: "temperature" | "mechanical" | "dynamics";
  height?: number;
}

export function TelemetryChart({ data, metricType, height = 280 }: TelemetryChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    time: d.timestamp ? d.timestamp.split("T")[1]?.slice(0, 8) || d.timestamp : "",
  }));

  if (!formattedData.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-xs font-mono">
        Awaiting live telemetry stream packets...
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
          <XAxis
            dataKey="time"
            stroke="#64748B"
            fontSize={10}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis stroke="#64748B" fontSize={10} tickLine={false} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0B1220",
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: "0.75rem",
              fontSize: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />

          {metricType === "temperature" && (
            <>
              <Line
                type="monotone"
                dataKey="process_temp_k"
                name="Process Temp (K)"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="air_temp_k"
                name="Air Temp (K)"
                stroke="#3B82F6"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="temp_diff_k"
                name="Delta T (K)"
                stroke="#F59E0B"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            </>
          )}

          {metricType === "mechanical" && (
            <>
              <Line
                type="monotone"
                dataKey="rotational_speed_rpm"
                name="Speed (RPM)"
                stroke="#22D3EE"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="torque_nm"
                name="Torque (Nm)"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </>
          )}

          {metricType === "dynamics" && (
            <>
              <Line
                type="monotone"
                dataKey="vibration_mms"
                name="Vibration (mm/s)"
                stroke="#F43F5E"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="pressure_bar"
                name="Pressure (bar)"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
