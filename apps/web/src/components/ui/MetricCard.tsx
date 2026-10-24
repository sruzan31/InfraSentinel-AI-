import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "green" | "amber" | "red" | "purple";
  badge?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  badge,
}: MetricCardProps) {
  const colorMap = {
    blue: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    green: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    red: "text-rose-400 border-rose-500/20 bg-rose-500/10",
    purple: "text-purple-400 border-purple-500/20 bg-purple-500/10",
  };

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold font-mono tracking-tight text-white">{value}</h3>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>}
    </div>
  );
}
