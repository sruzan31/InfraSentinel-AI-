"use client";

import { useEffect, useState } from "react";
import { Flame, AlertTriangle, ShieldCheck, Activity, Info } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Shell } from "@/components/layout/Shell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function AnomaliesPage() {
  const { selectedEquipmentId, setSelectedEquipmentId } = useAppStore();

  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    api.getEquipment().then(setEquipmentList).catch(console.error);
    if (selectedEquipmentId) {
      api.getAnomalyHistory(selectedEquipmentId, 50).then(setAnomalies).catch(console.error);
    }
  }, [selectedEquipmentId]);

  const selectedEquipment =
    equipmentList.find((e) => e.id === selectedEquipmentId) || equipmentList[0];

  const chartData = anomalies.map((a) => ({
    time: a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : "",
    score: Math.round(a.anomaly_score * 100) / 100,
    is_anomaly: a.is_anomaly,
    affected: a.affected_sensors,
  }));

  const detectedAnomalies = anomalies.filter((a) => a.is_anomaly);

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-rose-400" />
              <span>Unsupervised Anomaly Timeline</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Isolation Forest out-of-distribution anomaly scoring and latent operational drift analysis.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Equipment:</span>
            <select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(Number(e.target.value))}
              className="bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
            >
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.code} &mdash; {eq.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info banner explaining difference between Anomaly score and Failure risk */}
        <div className="glass-panel p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white">Statistical Boundary Note: </span>
            Anomaly detection utilizes an unsupervised Isolation Forest trained purely on healthy operating telemetry
            (5% contamination factor). It flags atypical multivariable combinations regardless of whether an explicit
            failure mode label exists. An anomaly score is never confounded with a calibrated failure probability.
          </div>
        </div>

        {/* Anomaly Score Timeline Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Isolation Forest Anomaly Score Timeline: {selectedEquipment?.name}
              </h3>
              <p className="text-xs text-slate-400">
                Scores above 0.60 trigger automatic investigation alerts.
              </p>
            </div>
            <span className="text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
              Threshold: &ge; 0.60
            </span>
          </div>

          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} domain={[0, 1.0]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B1220",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <ReferenceLine
                  y={0.6}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{ value: "Anomaly Threshold (0.60)", fill: "#EF4444", fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Anomaly Score"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#F43F5E" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detected Anomalies Table */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Out-of-Distribution Events Log</h3>
            <span className="text-xs font-mono text-slate-400">
              Total Detected: {detectedAnomalies.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1220] border-b border-white/5 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Event Timestamp</th>
                  <th className="py-3 px-4">Anomaly Score</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Affected Telemetry Channels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {detectedAnomalies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 font-mono">
                      No out-of-distribution anomalies detected in recent telemetry.
                    </td>
                  </tr>
                ) : (
                  detectedAnomalies.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {new Date(a.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-400">
                        {a.anomaly_score.toFixed(3)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono text-[10px] font-bold">
                          OUT OF DISTRIBUTION
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {a.affected_sensors || "Multivariate Drift"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}
