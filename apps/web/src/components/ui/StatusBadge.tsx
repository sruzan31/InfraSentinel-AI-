import React from "react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const norm = status?.toUpperCase() || "UNKNOWN";

  let styles = "bg-slate-500/10 text-slate-400 border-slate-500/30";
  let dot = "bg-slate-400";

  if (norm === "OPERATIONAL" || norm === "HEALTHY" || norm === "RESOLVED") {
    styles = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_-2px_rgba(34,197,94,0.3)]";
    dot = "bg-emerald-400";
  } else if (norm === "WARNING" || norm === "INVESTIGATING" || norm === "IN_PROGRESS") {
    styles = "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_10px_-2px_rgba(245,158,11,0.3)]";
    dot = "bg-amber-400";
  } else if (norm === "CRITICAL" || norm === "HIGH" || norm === "OPEN") {
    styles = "bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_10px_-2px_rgba(239,68,68,0.35)] animate-pulse";
    dot = "bg-rose-400";
  } else if (norm === "MAINTENANCE") {
    styles = "bg-purple-500/15 text-purple-400 border-purple-500/30";
    dot = "bg-purple-400";
  }

  const px = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium border ${px} ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{norm}</span>
    </span>
  );
}
