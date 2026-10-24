import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "green" | "black" | "amber" | "red" | "blue";
  badge?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "black",
  badge,
}: MetricCardProps) {
  const iconColorMap = {
    green: "bg-[#DFFFE6] text-black border border-[#76FB91]/40",
    black: "bg-black text-white",
    amber: "bg-amber-50 text-amber-600 border border-amber-200",
    red: "bg-rose-50 text-rose-600 border border-rose-200",
    blue: "bg-blue-50 text-blue-600 border border-blue-200",
  };

  return (
    <div className="clean-card p-6 rounded-[24px] relative overflow-hidden bg-white hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${iconColorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-light text-black tracking-tight">{value}</h3>
        {badge && (
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#EDEDED] text-black border border-neutral-300">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-neutral-500 mt-2">{subtitle}</p>}
    </div>
  );
}
