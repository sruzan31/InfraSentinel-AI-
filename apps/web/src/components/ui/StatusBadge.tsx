import React from "react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const norm = status?.toUpperCase() || "UNKNOWN";

  let styles = "bg-[#EDEDED] text-black border border-neutral-300";
  let dot = "bg-neutral-500";

  if (norm === "OPERATIONAL" || norm === "HEALTHY" || norm === "RESOLVED" || norm === "NORMAL") {
    styles = "bg-[#DFFFE6] text-black border border-[#76FB91]/40";
    dot = "bg-[#76FB91]";
  } else if (norm === "WARNING" || norm === "INVESTIGATING" || norm === "IN_PROGRESS" || norm === "MEDIUM") {
    styles = "bg-amber-50 text-amber-800 border border-amber-200";
    dot = "bg-amber-500";
  } else if (norm === "CRITICAL" || norm === "HIGH" || norm === "OPEN" || norm === "FLAGGED") {
    styles = "bg-rose-50 text-rose-800 border border-rose-200";
    dot = "bg-rose-500";
  } else if (norm === "MAINTENANCE") {
    styles = "bg-slate-100 text-slate-800 border border-slate-300";
    dot = "bg-slate-600";
  }

  const px = size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px} ${styles}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="font-mono tracking-tight">{norm}</span>
    </span>
  );
}
