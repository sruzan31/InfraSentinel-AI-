"use client";

import { useEffect, useState } from "react";
import { Flame, Info } from "lucide-react";
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-black tracking-tight flex items-center gap-2">
              <span>Anomaly Detection Timeline</span>
              <span className="w-2 h-2 rounded-full bg-[#76FB91]" />
            </h1>
            <p className="text-xs text-neutral-500 mt-1 font-light">
              Isolation Forest out-of-distribution scoring and latent multivariable sensor drift analysis.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 font-mono">Equipment:</span>
            <select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(Number(e.target.value))}
              className="bg-white border border-neutral-300 rounded-full px-4 py-2 text-xs text-black focus:outline-none focus:border-black font-medium shadow-sm"
            >
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.code} &mdash; {eq.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistical Note */}
        <div className="clean-card p-5 rounded-2xl bg-white border border-[#E5E5E5] flex items-start gap-3">
          <Info className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-700 leading-relaxed font-light">
            <span className="font-semibold text-black">Statistical Boundary Note: </span>
            Anomaly detection utilizes an unsupervised Isolation Forest trained purely on healthy operating telemetry
            (5% contamination factor). It flags atypical multivariable combinations regardless of whether an explicit
            failure mode label exists. An anomaly score is never confounded with a calibrated failure probability.
          </div>
        </div>

        {/* Anomaly Score Timeline Chart */}
        <div className="clean-card rounded-[32px] p-6 md:p-8 bg-white border border-[#EBEBEB] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0F0F0] gap-2">
            <div>
              <h3 className="text-base font-semibold text-black">
                Isolation Forest Anomaly Score: {selectedEquipment?.name}
              </h3>
              <p className="text-xs text-neutral-500 font-light">
                Scores &ge; 0.60 trigger automatic investigation alerts.
              </p>
            </div>
            <span className="text-xs font-mono text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              Threshold: &ge; 0.60
            </span>
          </div>

          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="time" stroke="#999999" fontSize={11} tickLine={false} axisLine={{ stroke: "#E5E5E5" }} />
                <YAxis stroke="#999999" fontSize={11} tickLine={false} axisLine={{ stroke: "#E5E5E5" }} domain={[0, 1.0]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E5E5",
                    borderRadius: "16px",
                    fontSize: "12px",
                    color: "#000000",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                />
                <ReferenceLine
                  y={0.6}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{ value: "Anomaly Cutoff (0.60)", fill: "#EF4444", fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Anomaly Score"
                  stroke="#000000"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#76FB91", stroke: "#000000", strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detected Anomalies Table */}
        <div className="clean-card rounded-[32px] p-6 bg-white border border-[#EBEBEB] overflow-hidden">
          <div className="pb-4 border-b border-[#F0F0F0] flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-black">Out-of-Distribution Events Log</h3>
            <span className="text-xs font-mono text-neutral-500">
              Total Detected: {detectedAnomalies.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F0F0F0] text-neutral-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-normal">Event Timestamp</th>
                  <th className="py-3 px-4 font-normal">Anomaly Score</th>
                  <th className="py-3 px-4 font-normal">Classification</th>
                  <th className="py-3 px-4 font-normal">Affected Sensor Channels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {detectedAnomalies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-neutral-400 font-mono">
                      No out-of-distribution anomalies detected in recent telemetry.
                    </td>
                  </tr>
                ) : (
                  detectedAnomalies.map((a) => (
                    <tr key={a.id} className="hover:bg-[#FAFAFA] transition">
                      <td className="py-3.5 px-4 font-mono text-neutral-500">
                        {new Date(a.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                        {a.anomaly_score.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[11px] font-bold">
                          ANOMALY
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-black font-medium">
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
