"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Check } from "lucide-react";
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-black tracking-tight flex items-center gap-2">
              <span>Alerts Center</span>
              <span className="w-2 h-2 rounded-full bg-[#76FB91]" />
            </h1>
            <p className="text-xs text-neutral-500 mt-1 font-light">
              Multi-tiered industrial rule engine with automated escalation and cooldown deduplication.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {["ALL", "CRITICAL", "HIGH", "WARNING", "INFO"].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  severityFilter === s
                    ? "bg-black text-white"
                    : "bg-[#EDEDED] text-black hover:bg-neutral-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="clean-card rounded-[32px] p-6 md:p-8 bg-white border border-[#EBEBEB]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0F0F0] gap-4 mb-4">
            <h3 className="text-base font-semibold text-black">Triggered Reliability Alerts</h3>
            <div className="flex items-center gap-2">
              {["ALL", "ACTIVE", "ACKNOWLEDGED", "RESOLVED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                    statusFilter === st
                      ? "bg-black text-white"
                      : "text-neutral-500 hover:text-black hover:bg-[#F4F4F4]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#F0F0F0]">
            {alerts.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs font-mono">
                No alerts match the current filter criteria.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="py-4 hover:bg-[#FAFAFA] px-2 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                        alert.severity === "CRITICAL"
                          ? "bg-rose-500 animate-pulse"
                          : alert.severity === "HIGH"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-black">{alert.title}</span>
                        <StatusBadge status={alert.severity} size="sm" />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDEDED] text-black">
                          Rule: {alert.rule_code}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed font-light">{alert.message}</p>
                      {alert.acknowledged_by && (
                        <p className="text-[10px] text-emerald-700 mt-1 font-mono">
                          Acknowledged by {alert.acknowledged_by} at{" "}
                          {new Date(alert.acknowledged_at).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {alert.status === "ACTIVE" && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="btn-tertiary px-3.5 py-1.5 text-xs"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status !== "RESOLVED" && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                    {alert.status === "RESOLVED" && (
                      <span className="text-[11px] font-mono text-neutral-400">Resolved</span>
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
