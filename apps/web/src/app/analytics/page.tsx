"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Download, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
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
            <h1 className="text-3xl font-light text-black tracking-tight flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#EDEDED] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-black" />
              </span>
              <span>Fleet Analytics & Executive Reports</span>
            </h1>
            <p className="text-xs text-black/50 mt-1">
              Aggregated reliability trends, alert distributions, and operational audit reports.
            </p>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-black/85 text-white font-medium text-xs transition shadow-sm"
          >
            <Download className="w-4 h-4 text-[#76FB91]" />
            <span>Export Fleet CSV Report</span>
          </button>
        </div>

        {/* 24-Hour Fleet Health Score Trend */}
        <div className="bg-white p-6 rounded-[28px] border border-[#CCCCCC]/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-black flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-black" />
                <span>24-Hour Fleet Health Score Trajectory</span>
              </h3>
              <p className="text-xs text-black/50">
                Composite uptime and risk index averaged across all monitored industrial assets.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-black bg-[#DFFFE6] border border-[#76FB91]/50 px-3.5 py-1.5 rounded-full">
              Current: {overview?.fleet_health_score ?? "96.5"}%
            </span>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={trends?.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#76FB91" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#76FB91" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
                <XAxis dataKey="timestamp" stroke="#999999" fontSize={10} tickLine={false} />
                <YAxis stroke="#999999" fontSize={10} tickLine={false} domain={[85, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#CCCCCC",
                    borderRadius: "1rem",
                    fontSize: "12px",
                    color: "#000000",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="health_score"
                  stroke="#000000"
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
          <div className="bg-white p-6 rounded-[28px] border border-[#CCCCCC]/60 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-black flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-black" />
              <span>Historical Alert Severity Breakdown</span>
            </h3>

            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={trends?.alert_distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
                  <XAxis dataKey="name" stroke="#999999" fontSize={11} tickLine={false} />
                  <YAxis stroke="#999999" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#CCCCCC",
                      borderRadius: "1rem",
                      fontSize: "12px",
                      color: "#000000",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {(trends?.alert_distribution || []).map((entry: any, index: number) => {
                      const fill = entry.name === "CRITICAL" ? "#EF4444" : entry.name === "WARNING" ? "#F59E0B" : "#76FB91";
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Executive Report Card */}
          <div className="bg-white p-6 rounded-[28px] border border-[#CCCCCC]/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-black flex items-center gap-2">
                  <FileText className="w-4 h-4 text-black" />
                  <span>Executive Audit Digest</span>
                </h3>
                <span className="text-[10px] font-mono text-black/50 px-2.5 py-1 rounded-full bg-[#EDEDED]">
                  {reportSummary?.report_id || "REP-CURRENT"}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 bg-[#F7F7F8] rounded-2xl border border-[#EBEBEB] flex justify-between">
                  <span className="text-black/60">Audited Monitored Assets:</span>
                  <span className="text-black font-mono font-semibold">{reportSummary?.equipment_count ?? 4} Units</span>
                </div>
                <div className="p-3.5 bg-[#F7F7F8] rounded-2xl border border-[#EBEBEB] flex justify-between">
                  <span className="text-black/60">Total Lifecycle Incidents:</span>
                  <span className="text-black font-mono font-semibold">{reportSummary?.total_incidents ?? 0} Logged</span>
                </div>
                <div className="p-3.5 bg-[#F7F7F8] rounded-2xl border border-[#EBEBEB] flex justify-between">
                  <span className="text-black/60">Completed Work Orders:</span>
                  <span className="text-black font-mono font-semibold">{reportSummary?.total_maintenance_records ?? 0} Records</span>
                </div>
                <div className="p-3.5 bg-[#F7F7F8] rounded-2xl border border-[#EBEBEB] flex justify-between">
                  <span className="text-black/60">Generated By:</span>
                  <span className="text-black font-mono font-semibold">{reportSummary?.generated_by || "Operator"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="w-full mt-4 py-3 rounded-full bg-[#EDEDED] hover:bg-[#CCCCCC]/50 text-black text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>Download Signed Audit Log</span>
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
