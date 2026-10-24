"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Download, PieChart as PieIcon, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Shell } from "@/components/layout/Shell";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [reportSummary, setReportSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAnalyticsOverview(),
      api.getFleetTrends(),
      api.getReportSummary(),
    ])
      .then(([ov, tr, rep]) => {
        setOverview(ov);
        setTrends(tr);
        setReportSummary(rep);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadCsv = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.open(`${apiUrl}/api/v1/reports/export/csv`, "_blank");
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <span>Fleet Analytics & Executive Reports</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Aggregated reliability trends, alert distributions, and operational audit reports.
            </p>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Fleet CSV Report</span>
          </button>
        </div>

        {/* 24-Hour Fleet Health Score Trend */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>24-Hour Fleet Health Score Trajectory</span>
              </h3>
              <p className="text-xs text-slate-400">
                Composite uptime and risk index averaged across all monitored industrial assets.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg">
              Current: {overview?.fleet_health_score ?? "96.5"}%
            </span>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={trends?.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                <XAxis dataKey="timestamp" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} domain={[85, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B1220",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="health_score"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#healthGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2 Grid: Alert Severity Distribution + Executive Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alert Severity Distribution */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Historical Alert Severity Breakdown</span>
            </h3>

            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={trends?.alert_distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B1220",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {(trends?.alert_distribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Executive Report Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Executive Audit Digest</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {reportSummary?.report_id || "REP-CURRENT"}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-[#0B1220] rounded-xl border border-white/5 flex justify-between">
                  <span className="text-slate-400">Audited Monitored Assets:</span>
                  <span className="text-white font-mono font-bold">{reportSummary?.equipment_count ?? 4} Units</span>
                </div>
                <div className="p-3 bg-[#0B1220] rounded-xl border border-white/5 flex justify-between">
                  <span className="text-slate-400">Total Lifecycle Incidents:</span>
                  <span className="text-amber-400 font-mono font-bold">{reportSummary?.total_incidents ?? 0} Logged</span>
                </div>
                <div className="p-3 bg-[#0B1220] rounded-xl border border-white/5 flex justify-between">
                  <span className="text-slate-400">Completed Work Orders:</span>
                  <span className="text-emerald-400 font-mono font-bold">{reportSummary?.total_maintenance_records ?? 0} Records</span>
                </div>
                <div className="p-3 bg-[#0B1220] rounded-xl border border-white/5 flex justify-between">
                  <span className="text-slate-400">Generated By:</span>
                  <span className="text-blue-400 font-mono font-semibold">{reportSummary?.generated_by || "Operator"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Download Signed Audit Log</span>
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
