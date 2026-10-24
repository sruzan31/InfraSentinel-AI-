"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Layers,
  AlertTriangle,
  Flame,
  Zap,
  TrendingUp,
  Cpu,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Radio,
  Search,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TelemetryChart } from "@/components/charts/TelemetryChart";
import { RiskGauge } from "@/components/charts/RiskGauge";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function DashboardPage() {
  const {
    selectedEquipmentId,
    setSelectedEquipmentId,
    telemetryStream,
    latestFrame,
  } = useAppStore();

  const [analytics, setAnalytics] = useState<any>(null);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [overviewData, eqData, alertsData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getEquipment(),
        api.getAlerts({ status: "ACTIVE" }),
      ]);
      setAnalytics(overviewData);
      setEquipmentList(eqData);
      setActiveAlerts(alertsData.slice(0, 5));
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await api.acknowledgeAlert(alertId);
      setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (e) {
      console.error(e);
    }
  };

  const selectedEquipment =
    equipmentList.find((e) => e.id === selectedEquipmentId) || equipmentList[0];

  const currentRiskProb =
    latestFrame?.equipment_id === selectedEquipmentId
      ? latestFrame.ai_prediction.failure_risk_probability
      : selectedEquipment?.status === "CRITICAL"
      ? 0.88
      : selectedEquipment?.status === "WARNING"
      ? 0.52
      : 0.08;

  const currentRiskCategory =
    latestFrame?.equipment_id === selectedEquipmentId
      ? latestFrame.ai_prediction.risk_category
      : selectedEquipment?.status === "CRITICAL"
      ? "CRITICAL"
      : selectedEquipment?.status === "WARNING"
      ? "HIGH"
      : "LOW";

  const currentFailureMode =
    latestFrame?.equipment_id === selectedEquipmentId
      ? latestFrame.ai_prediction.predicted_failure_mode
      : "NONE";

  const topDrivers =
    latestFrame?.equipment_id === selectedEquipmentId && latestFrame.ai_prediction.top_drivers?.length
      ? latestFrame.ai_prediction.top_drivers
      : [];

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Shell>
      <div className="space-y-8">
        {/* Dashboard Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentDate} &bull; CONTINUOUS TELEMETRY MONITORING</span>
            </div>
            <h1 className="text-3xl font-light text-black tracking-tight flex items-center gap-2">
              <span>Overview</span>
              <span className="w-2 h-2 rounded-full bg-[#76FB91]" />
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/monitoring"
              className="btn-tertiary px-4 py-2 text-xs flex items-center gap-2"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Telemetry Feed</span>
            </Link>
            <Link
              href="/incidents"
              className="btn-primary px-4 py-2 text-xs flex items-center gap-2 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-[#76FB91]" />
              <span>Incidents</span>
            </Link>
          </div>
        </div>

        {/* 4 Clean Metric Cards with Oversized Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Total Equipment"
            value={analytics?.total_equipment ?? "4"}
            subtitle="Monitored Rotational Units"
            icon={Layers}
            color="black"
          />
          <MetricCard
            title="Healthy Equipment"
            value={analytics?.operational_equipment ?? "3"}
            subtitle="Nominal Steady State"
            icon={CheckCircle2}
            color="green"
            badge="Healthy"
          />
          <MetricCard
            title="Elevated Risk"
            value={
              (analytics?.warning_equipment || 0) + (analytics?.critical_equipment || 0)
            }
            subtitle="Audit Scheduled"
            icon={AlertTriangle}
            color={analytics?.critical_equipment > 0 ? "red" : "amber"}
            badge={analytics?.critical_equipment > 0 ? "Critical" : "Warning"}
          />
          <MetricCard
            title="Active Alerts"
            value={analytics?.active_alerts ?? "0"}
            subtitle="Rule Engine Events"
            icon={ShieldAlert}
            color="black"
          />
        </div>

        {/* Main Grid: Monitoring Panel + AI Insights Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Monitoring Panel (2 columns) */}
          <div className="lg:col-span-2 clean-card rounded-[32px] p-6 md:p-8 bg-white border border-[#EBEBEB] flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0F0F0] gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#76FB91] animate-pulse" />
                    <h3 className="text-base font-semibold text-black">
                      Live Telemetry: {selectedEquipment?.name}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Process & Ambient Fluid Temperature Gradient (&Delta;T) and Sensor Deviations
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedEquipmentId}
                    onChange={(e) => setSelectedEquipmentId(Number(e.target.value))}
                    className="bg-[#EDEDED] border border-neutral-300 rounded-full px-3 py-1 text-xs text-black focus:outline-none font-medium"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.code}
                      </option>
                    ))}
                  </select>
                  <StatusBadge status={selectedEquipment?.status || "OPERATIONAL"} size="sm" />
                </div>
              </div>

              <TelemetryChart
                data={telemetryStream.length ? telemetryStream.map((f) => ({
                  timestamp: f.timestamp,
                  air_temp_k: f.measurements.air_temp_k,
                  process_temp_k: f.measurements.process_temp_k,
                  temp_diff_k: f.measurements.temp_diff_k,
                })) : []}
                metricType="temperature"
                height={260}
              />
            </div>

            {/* Bottom 4 live measurements strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#F0F0F0] text-center mt-4">
              <div className="p-3 bg-[#F9F9F9] rounded-2xl border border-neutral-200">
                <span className="text-[10px] text-neutral-500 uppercase font-mono">Process Temp</span>
                <p className="text-sm font-semibold text-black mt-0.5 font-mono">
                  {latestFrame?.measurements.process_temp_k ?? 310.5} K
                </p>
              </div>
              <div className="p-3 bg-[#F9F9F9] rounded-2xl border border-neutral-200">
                <span className="text-[10px] text-neutral-500 uppercase font-mono">Shaft Speed</span>
                <p className="text-sm font-semibold text-black mt-0.5 font-mono">
                  {latestFrame?.measurements.rotational_speed_rpm ?? 1530} RPM
                </p>
              </div>
              <div className="p-3 bg-[#F9F9F9] rounded-2xl border border-neutral-200">
                <span className="text-[10px] text-neutral-500 uppercase font-mono">Torque Load</span>
                <p className="text-sm font-semibold text-black mt-0.5 font-mono">
                  {latestFrame?.measurements.torque_nm ?? 40.2} Nm
                </p>
              </div>
              <div className="p-3 bg-[#F9F9F9] rounded-2xl border border-neutral-200">
                <span className="text-[10px] text-neutral-500 uppercase font-mono">Vibration</span>
                <p className="text-sm font-semibold text-black mt-0.5 font-mono">
                  {latestFrame?.measurements.vibration_mms ?? 2.4} mm/s
                </p>
              </div>
            </div>
          </div>

          {/* AI Insights Panel (1 column) with soft green accent */}
          <div className="clean-card rounded-[32px] p-6 md:p-8 bg-white border border-[#EBEBEB] flex flex-col justify-between relative overflow-hidden">
            {/* Top green glow */}
            <div className="absolute top-0 right-0 w-48 h-48 green-subtle-glow rounded-full pointer-events-none -z-0" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500">
                  AI PREDICTIVE RISK
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DFFFE6] text-black font-bold">
                  v1.0.0
                </span>
              </div>

              <h3 className="text-xl font-light text-black mb-1">Failure Probability</h3>
              <p className="text-xs text-neutral-500 mb-6 font-light">
                Calibrated XGBoost supervised estimation on {selectedEquipment?.code}.
              </p>

              <div className="flex justify-center py-2">
                <RiskGauge
                  probability={currentRiskProb}
                  category={currentRiskCategory}
                  mode={currentFailureMode}
                  size={190}
                />
              </div>

              {/* Contributing Features / Factors */}
              <div className="mt-6 space-y-2">
                <span className="text-[11px] font-medium text-black block mb-2">
                  Top Contributing Physical Drivers:
                </span>
                {topDrivers.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-light bg-[#F9F9F9] p-3 rounded-2xl border border-neutral-200">
                    Operating within nominal envelope. Zero risk-elevating deviations.
                  </p>
                ) : (
                  topDrivers.map((d: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#F9F9F9] rounded-xl border border-neutral-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-black">{d.feature}</span>
                      <span className="font-mono text-[11px] text-neutral-600">
                        {d.value} (base {d.baseline})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Link
              href="/predictions"
              className="btn-primary mt-6 w-full py-3 text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Explore SHAP Attribution</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Equipment Matrix Table */}
        <div className="clean-card rounded-[32px] p-6 md:p-8 bg-white border border-[#EBEBEB] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-light text-black">Monitored Equipment Fleet</h3>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Real-time operational status, location, and composite health indices.
              </p>
            </div>

            <Link
              href="/equipment"
              className="btn-tertiary px-4 py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>View All Equipment</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F0F0F0] text-neutral-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-normal">Asset Code</th>
                  <th className="py-3 px-4 font-normal">Equipment Name</th>
                  <th className="py-3 px-4 font-normal">Variant</th>
                  <th className="py-3 px-4 font-normal">Location</th>
                  <th className="py-3 px-4 font-normal">Operating Status</th>
                  <th className="py-3 px-4 font-normal">Health Index</th>
                  <th className="py-3 px-4 font-normal text-right">Selection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {equipmentList.map((eq) => {
                  const isSelected = eq.id === selectedEquipmentId;
                  return (
                    <tr
                      key={eq.id}
                      onClick={() => setSelectedEquipmentId(eq.id)}
                      className={`cursor-pointer transition ${
                        isSelected ? "bg-[#DFFFE6]/40" : "hover:bg-[#FAFAFA]"
                      }`}
                    >
                      <td className="py-4 px-4 font-mono font-bold text-black">{eq.code}</td>
                      <td className="py-4 px-4 font-medium text-black">{eq.name}</td>
                      <td className="py-4 px-4 text-neutral-500 font-mono uppercase">
                        {eq.equipment_type} ({eq.quality_type})
                      </td>
                      <td className="py-4 px-4 text-neutral-600">{eq.location}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={eq.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-black">
                        {eq.health_score?.toFixed(1)}%
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            isSelected
                              ? "bg-black text-white"
                              : "bg-[#EDEDED] text-black hover:bg-neutral-300"
                          }`}
                        >
                          {isSelected ? "Active" : "Select"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Alerts Triage Feed */}
        <div className="clean-card rounded-[32px] p-6 md:p-8 bg-white border border-[#EBEBEB]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-light text-black flex items-center gap-2">
                <span>Active Alert Triage Feed</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EDEDED] text-black font-mono font-bold">
                  {activeAlerts.length} Active
                </span>
              </h3>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Prioritized rule engine warnings requiring operator acknowledgment.
              </p>
            </div>
            <Link href="/alerts" className="text-xs text-black font-medium hover:underline">
              All Alerts &rarr;
            </Link>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="py-8 text-center text-neutral-400 text-xs font-mono">
              Zero active alerts. All monitored assets operating within normal physical parameters.
            </div>
          ) : (
            <div className="divide-y divide-[#F0F0F0]">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                        alert.severity === "CRITICAL"
                          ? "bg-rose-500"
                          : alert.severity === "HIGH"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-black">{alert.title}</span>
                        <StatusBadge status={alert.severity} size="sm" />
                        <span className="text-[10px] font-mono text-neutral-400">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">{alert.message}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="btn-tertiary px-3.5 py-1.5 text-xs self-end sm:self-center"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
