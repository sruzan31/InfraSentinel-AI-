"use client";

import { Bell, ShieldAlert, Cpu } from "lucide-react";
import Link from "next/link";
import { SimulatorControl } from "../simulator/SimulatorControl";
import { useWebSocket } from "@/lib/useWebSocket";
import { useAppStore } from "@/lib/store";

export function Topbar() {
  const { isConnected } = useWebSocket();
  const latestFrame = useAppStore((s) => s.latestFrame);
  const isFlagged = latestFrame?.ai_prediction?.is_flagged;

  return (
    <header className="h-16 bg-[#080E1A]/80 backdrop-blur-md border-b border-white/5 fixed top-0 right-0 left-64 z-30 flex items-center justify-between px-6">
      {/* Left: WebSocket Connection & System Heartbeat */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-white/5">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-rose-500 animate-pulse"
            }`}
          />
          <span className="text-[11px] font-mono text-slate-300">
            {isConnected ? "WS CONNECTED" : "RECONNECTING"}
          </span>
        </div>

        {/* Global Alert Notification Pill if equipment is in risk state */}
        {isFlagged && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-semibold animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>CRITICAL ALERT: {latestFrame?.equipment_code} {latestFrame?.ai_prediction?.predicted_failure_mode}</span>
          </div>
        )}
      </div>

      {/* Right: Simulator Controller & Alerts Shortcut */}
      <div className="flex items-center gap-4">
        <SimulatorControl />

        <Link
          href="/alerts"
          className="relative p-2 text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 rounded-xl border border-white/10 transition"
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
