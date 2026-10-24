"use client";

import { Bell, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { SimulatorControl } from "../simulator/SimulatorControl";
import { useWebSocket } from "@/lib/useWebSocket";
import { useAppStore } from "@/lib/store";

export function Topbar() {
  const { isConnected } = useWebSocket();
  const latestFrame = useAppStore((s) => s.latestFrame);
  const isFlagged = latestFrame?.ai_prediction?.is_flagged;

  return (
    <header className="h-20 bg-white border-b border-[#EBEBEB] fixed top-0 right-0 left-64 z-30 flex items-center justify-between px-8">
      {/* Left: WebSocket Connection & System Heartbeat */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDEDED] border border-neutral-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-[#76FB91] shadow-[0_0_8px_#76FB91]" : "bg-rose-500 animate-pulse"
            }`}
          />
          <span className="text-[11px] font-mono font-medium text-black tracking-tight">
            {isConnected ? "WS STREAM ACTIVE" : "DISCONNECTED"}
          </span>
        </div>

        {/* Global Alert Notification Pill if equipment is in risk state */}
        {isFlagged && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>CRITICAL: {latestFrame?.equipment_code} {latestFrame?.ai_prediction?.predicted_failure_mode}</span>
          </div>
        )}
      </div>

      {/* Right: Simulator Controller & Alerts Shortcut */}
      <div className="flex items-center gap-4">
        <SimulatorControl />

        <Link
          href="/alerts"
          className="relative p-2.5 text-black hover:bg-[#EDEDED] bg-[#F4F4F4] rounded-full border border-neutral-300 transition"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4" />
          {isFlagged && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          )}
        </Link>
      </div>
    </header>
  );
}
