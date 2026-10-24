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
  size = 190,
}: RiskGaugeProps) {
  const percent = Math.min(100, Math.max(0, Math.round(probability * 100)));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 270 degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * percent) / 100;

  let color = "#76FB91"; // neon green
  let glowColor = "rgba(118, 251, 145, 0.4)";
  if (percent >= 75) {
    color = "#EF4444";
    glowColor = "rgba(239, 68, 68, 0.3)";
  } else if (percent >= 45) {
    color = "#F59E0B";
    glowColor = "rgba(245, 158, 11, 0.3)";
  } else if (percent >= 25) {
    color = "#3B82F6";
    glowColor = "rgba(59, 130, 246, 0.25)";
  }

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[135deg]">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EDEDED"
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
            filter: `drop-shadow(0 0 6px ${glowColor})`,
          }}
        />
      </svg>
      {/* Center Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-light text-black tracking-tight">{percent}%</span>
        <span
          className="text-[11px] font-semibold tracking-wider uppercase mt-1 px-2.5 py-0.5 rounded-full"
          style={{
            backgroundColor: percent < 25 ? "#DFFFE6" : percent < 45 ? "#EFF6FF" : percent < 75 ? "#FEF3C7" : "#FEE2E2",
            color: percent < 25 ? "#000000" : percent < 45 ? "#1D4ED8" : percent < 75 ? "#B45309" : "#B91C1C",
          }}
        >
          {category}
        </span>
        {mode !== "NONE" && (
          <span className="text-[10px] text-neutral-500 max-w-[120px] truncate px-1 mt-1 font-mono">
            {mode}
          </span>
        )}
      </div>
    </div>
  );
}
