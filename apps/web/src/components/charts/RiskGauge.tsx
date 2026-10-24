"use client";

import React from "react";

interface RiskGaugeProps {
  probability: number; // 0.0 to 1.0
  category: string;    // LOW, MEDIUM, HIGH, CRITICAL
  mode?: string;
  size?: number;
}

export function RiskGauge({
  probability,
  category,
  mode = "NONE",
  size = 180,
}: RiskGaugeProps) {
  const percent = Math.min(100, Math.max(0, Math.round(probability * 100)));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * percent) / 100;

  let color = "#10B981"; // green
  let glow = "rgba(16, 185, 129, 0.3)";
  if (percent >= 75) {
    color = "#EF4444";
    glow = "rgba(239, 68, 68, 0.4)";
  } else if (percent >= 45) {
    color = "#F59E0B";
    glow = "rgba(245, 158, 11, 0.35)";
  } else if (percent >= 20) {
    color = "#3B82F6";
    glow = "rgba(59, 130, 246, 0.3)";
  }

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[135deg]">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E293B"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Value track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.6s ease-in-out, stroke 0.4s ease",
            filter: `drop-shadow(0 0 8px ${glow})`,
          }}
        />
      </svg>
      {/* Center Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black font-mono tracking-tight text-white">{percent}%</span>
        <span
          className="text-[11px] font-bold tracking-wider font-mono uppercase mt-0.5"
          style={{ color }}
        >
          {category}
        </span>
        {mode !== "NONE" && (
          <span className="text-[9px] text-slate-400 font-mono max-w-[120px] truncate px-1">
            {mode}
          </span>
        )}
      </div>
    </div>
  );
}
