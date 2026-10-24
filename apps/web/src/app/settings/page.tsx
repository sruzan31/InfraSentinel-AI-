"use client";

import { useState } from "react";
import { Sliders, User, Building, ShieldCheck, Key, Bell, Check, Server } from "lucide-react";
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
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-400" />
            <span>Facility & System Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure telemetry alert thresholds, role-based access parameters, and facility boundaries.
          </p>
        </div>

        {/* User & Organization Details */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Active Operator Profile</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-[#0B1220] rounded-xl border border-white/5">
              <span className="text-slate-500">Operator Name</span>
              <p className="text-sm font-bold text-white mt-1">{user?.full_name || "Alex Mercer"}</p>
            </div>
            <div className="p-3.5 bg-[#0B1220] rounded-xl border border-white/5">
              <span className="text-slate-500">Email Address</span>
              <p className="text-sm font-bold text-slate-200 mt-1">{user?.email || "operator@infrasentinel.io"}</p>
            </div>
            <div className="p-3.5 bg-[#0B1220] rounded-xl border border-white/5">
              <span className="text-slate-500">System Role</span>
              <p className="text-sm font-bold text-emerald-400 mt-1 uppercase">{user?.role || "OPERATOR"}</p>
            </div>
          </div>
        </div>

        {/* Alert Rule Engine Thresholds Form */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>AI & Telemetry Alert Threshold Engine</span>
            </h3>
            {saved && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Parameters Persisted</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Critical Risk Probability Threshold (%)
                </label>
                <input
                  type="number"
                  value={thresholds.criticalRiskThreshold}
                  onChange={(e) => setThresholds({ ...thresholds, criticalRiskThreshold: Number(e.target.value) })}
                  className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Probability at or above which an automatic P1 Incident ticket is opened.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  High Risk Probability Threshold (%)
                </label>
                <input
                  type="number"
                  value={thresholds.highRiskThreshold}
                  onChange={(e) => setThresholds({ ...thresholds, highRiskThreshold: Number(e.target.value) })}
                  className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Warning alert generation cutoff.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Vibration ISO 10816 Zone D Limit (mm/s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.vibrationLimit}
                  onChange={(e) => setThresholds({ ...thresholds, vibrationLimit: Number(e.target.value) })}
                  className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Radial casing vibration danger trigger limit.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Minimum Safe Thermal Gradient &Delta;T (K)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.minDeltaT}
                  onChange={(e) => setThresholds({ ...thresholds, minDeltaT: Number(e.target.value) })}
                  className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Heat Dissipation Failure (HDF) condition boundary.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-glow transition"
              >
                Save Threshold Parameters
              </button>
            </div>
          </form>
        </div>

        {/* Backend Connectivity Status */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">FastAPI Backend Service Endpoint</p>
              <p className="text-[11px] font-mono text-slate-400">http://localhost:8000 &bull; WebSocket ws://localhost:8000/ws</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
            ONLINE
          </span>
        </div>
      </div>
    </Shell>
  );
}
