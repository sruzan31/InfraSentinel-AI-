"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, Filter, Clock, Check } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts({
        severity: severityFilter === "ALL" ? undefined : severityFilter,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter]);

  const handleAcknowledge = async (id: number) => {
    try {
      const updated = await api.acknowledgeAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      const updated = await api.resolveAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span>Real-Time Alerts Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-tiered rule engine monitoring risk thresholds, anomaly spikes, and sensor limit violations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Filter Severity:</span>
            {["ALL", "CRITICAL", "HIGH", "WARNING", "INFO"].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  severityFilter === s
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-slate-800/40 text-slate-400 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Triggered Industrial Rule Alerts</h3>
            <div className="flex items-center gap-2">
              {["ALL", "ACTIVE", "ACKNOWLEDGED", "RESOLVED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                    statusFilter === st
                      ? "bg-blue-600/30 text-blue-400 border border-blue-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {alerts.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                No alerts match the current filter criteria.
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-slate-800/20 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${
                        alert.severity === "CRITICAL"
                          ? "bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]"
                          : alert.severity === "HIGH"
                          ? "bg-orange-500"
                          : alert.severity === "WARNING"
                          ? "bg-amber-400"
                          : "bg-blue-400"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{alert.title}</span>
                        <StatusBadge status={alert.severity} size="sm" />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                          Rule: {alert.rule_code}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                      {alert.acknowledged_by && (
                        <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                          Acknowledged by {alert.acknowledged_by} at{" "}
                          {new Date(alert.acknowledged_at).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {alert.status === "ACTIVE" && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status !== "RESOLVED" && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                    {alert.status === "RESOLVED" && (
                      <span className="text-[11px] font-mono text-slate-500">Resolved</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
