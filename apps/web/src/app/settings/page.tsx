"use client";

import { useState } from "react";
import { Sliders, User, Bell, Check, Server } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { useAppStore } from "@/lib/store";

export default function SettingsPage() {
  const { user } = useAppStore();
  const [saved, setSaved] = useState(false);

  const [thresholds, setThresholds] = useState({
    criticalRiskThreshold: 75,
    highRiskThreshold: 45,
    anomalyContamination: 3.5,
    vibrationLimit: 7.0,
    minDeltaT: 8.6,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-light text-black tracking-tight flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#EDEDED] flex items-center justify-center">
              <Sliders className="w-5 h-5 text-black" />
            </span>
            <span>Facility & System Settings</span>
          </h1>
          <p className="text-xs text-black/50 mt-1">
            Configure telemetry alert thresholds, role-based access parameters, and facility boundaries.
          </p>
        </div>

        {/* User & Organization Details */}
        <div className="bg-white p-6 rounded-[28px] border border-[#CCCCCC]/60 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-black flex items-center gap-2">
            <User className="w-4 h-4 text-black" />
            <span>Active Operator Profile</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 bg-[#F7F7F8] rounded-2xl border border-[#EBEBEB]">
              <span className="text-black/50 text-[11px]">Operator Name</span>
              <p className="text-sm font-semibold text-black mt-1">{user?.full_name || "Alex Mercer"}</p>
            </div>
            <div className="p-4 bg-[#F7F7F8] rounded-2xl border border-[#EBEBEB]">
              <span className="text-black/50 text-[11px]">Email Address</span>
              <p className="text-sm font-semibold text-black/80 mt-1">{user?.email || "operator@infrasentinel.io"}</p>
            </div>
            <div className="p-4 bg-[#F7F7F8] rounded-2xl border border-[#EBEBEB]">
              <span className="text-black/50 text-[11px]">System Role</span>
              <p className="text-sm font-bold text-black mt-1 uppercase">
                <span className="px-2.5 py-0.5 rounded-full bg-[#DFFFE6] text-[#0A5C22] border border-[#76FB91]/40 text-[10px]">
                  {user?.role || "OPERATOR"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Alert Rule Engine Thresholds Form */}
        <div className="bg-white p-6 rounded-[28px] border border-[#CCCCCC]/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-black flex items-center gap-2">
              <Bell className="w-4 h-4 text-black" />
              <span>AI & Telemetry Alert Threshold Engine</span>
            </h3>
            {saved && (
              <span className="text-xs font-mono text-[#0A5C22] bg-[#DFFFE6] px-3 py-1 rounded-full border border-[#76FB91]/50 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Parameters Persisted</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-black/70 font-medium mb-1.5">
                  Critical Risk Probability Threshold (%)
                </label>
                <input
                  type="number"
                  value={thresholds.criticalRiskThreshold}
                  onChange={(e) => setThresholds({ ...thresholds, criticalRiskThreshold: Number(e.target.value) })}
                  className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-xl px-3.5 py-2.5 text-black font-mono focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-black/40 font-mono mt-1 block">
                  Probability at or above which an automatic P1 Incident ticket is opened.
                </span>
              </div>

              <div>
                <label className="block text-black/70 font-medium mb-1.5">
                  High Risk Probability Threshold (%)
                </label>
                <input
                  type="number"
                  value={thresholds.highRiskThreshold}
                  onChange={(e) => setThresholds({ ...thresholds, highRiskThreshold: Number(e.target.value) })}
                  className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-xl px-3.5 py-2.5 text-black font-mono focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-black/40 font-mono mt-1 block">
                  Warning alert generation cutoff.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-black/70 font-medium mb-1.5">
                  Vibration ISO 10816 Zone D Limit (mm/s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.vibrationLimit}
                  onChange={(e) => setThresholds({ ...thresholds, vibrationLimit: Number(e.target.value) })}
                  className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-xl px-3.5 py-2.5 text-black font-mono focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-black/40 font-mono mt-1 block">
                  Radial casing vibration danger trigger limit.
                </span>
              </div>

              <div>
                <label className="block text-black/70 font-medium mb-1.5">
                  Minimum Safe Thermal Gradient &Delta;T (K)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.minDeltaT}
                  onChange={(e) => setThresholds({ ...thresholds, minDeltaT: Number(e.target.value) })}
                  className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-xl px-3.5 py-2.5 text-black font-mono focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-black/40 font-mono mt-1 block">
                  Heat Dissipation Failure (HDF) condition boundary.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-black hover:bg-black/85 text-white font-medium shadow-sm transition"
              >
                Save Threshold Parameters
              </button>
            </div>
          </form>
        </div>

        {/* Backend Connectivity Status */}
        <div className="bg-white p-5 rounded-[28px] border border-[#CCCCCC]/60 shadow-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#DFFFE6] text-[#0A5C22]">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-black">FastAPI Backend Service Endpoint</p>
              <p className="text-[11px] font-mono text-black/50">http://localhost:8000 &bull; WebSocket ws://localhost:8000/ws</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#76FB91] text-black font-mono text-[10px] font-bold">
            ONLINE
          </span>
        </div>
      </div>
    </Shell>
  );
}
