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
  CheckCircle,
  Radio
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

  // Active selected equipment
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

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header Title & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Mission Command Center</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time failure risk estimation, unsupervised anomaly timeline, and asset telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/monitoring"
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Full Telemetry Feed</span>
            </Link>
            <Link
              href="/incidents"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Incident Response</span>
            </Link>
          </div>
        </div>

        {/* Fleet KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            title="Total Assets"
            value={analytics?.total_equipment ?? "4"}
            subtitle="Rotating Machinery"
            icon={Layers}
            color="blue"
          />
          <MetricCard
            title="Operational"
            value={analytics?.operational_equipment ?? "3"}
            subtitle="Nominal Regime"
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            title="Elevated Risk"
            value={
              (analytics?.warning_equipment || 0) + (analytics?.critical_equipment || 0)
            }
            subtitle="Requires Audit"
            icon={AlertTriangle}
            color="amber"
          />
          <MetricCard
            title="Active Anomalies"
            value={analytics?.active_anomalies ?? "0"}
            subtitle="Isolation Forest"
            icon={Flame}
            color="purple"
          />
          <MetricCard
            title="Critical Alerts"
            value={analytics?.critical_alerts ?? "0"}
            subtitle="Immediate Action"
            icon={ShieldAlert}
            color="red"
          />
          <MetricCard
            title="Fleet Health Index"
            value={`${analytics?.fleet_health_score ?? "96.5"}%`}
            subtitle="Composite MTBF"
            icon={TrendingUp}
            color="green"
          />
        </div>

        {/* Main Grid: Telemetry Stream + Risk Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Telemetry Mini-Center (Left 2 cols) */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Live Telemetry Stream: {selectedEquipment?.name || "Equipment"}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {selectedEquipment?.code}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Process vs Ambient Temperature Gradient (&Delta;T) and Sensor Deviations
                </p>
              </div>
              <StatusBadge status={selectedEquipment?.status || "OPERATIONAL"} size="sm" />
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

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5 text-center">
              <div className="bg-[#0B1220] p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono">Process Temp</span>
                <p className="text-sm font-bold font-mono text-rose-400">
                  {latestFrame?.measurements.process_temp_k ?? 310.5} K
                </p>
              </div>
              <div className="bg-[#0B1220] p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono">Rotational Speed</span>
                <p className="text-sm font-bold font-mono text-cyan-400">
                  {latestFrame?.measurements.rotational_speed_rpm ?? 1530} RPM
                </p>
              </div>
              <div className="bg-[#0B1220] p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono">Shaft Torque</span>
                <p className="text-sm font-bold font-mono text-purple-400">
                  {latestFrame?.measurements.torque_nm ?? 40.2} Nm
                </p>
              </div>
              <div className="bg-[#0B1220] p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono">Vibration</span>
                <p className="text-sm font-bold font-mono text-amber-400">
                  {latestFrame?.measurements.vibration_mms ?? 2.4} mm/s
                </p>
              </div>
            </div>
          </div>

          {/* AI Failure Risk Gauge (Right 1 col) */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-between text-center">
            <div className="w-full text-left mb-2">
              <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
                AI PREDICTIVE RISK
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Calibrated Failure Probability
              </h3>
            </div>

            <div className="py-4">
              <RiskGauge
                probability={currentRiskProb}
                category={currentRiskCategory}
                mode={currentFailureMode}
                size={190}
              />
            </div>

            <div className="w-full p-3 rounded-xl bg-[#0B1220] border border-white/5 text-left text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Model Engine:</span>
                <span className="text-white font-mono font-semibold">Calibrated XGBoost</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Health Score:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {selectedEquipment?.health_score?.toFixed(1) ?? "98.5"}%
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active Scenario:</span>
                <span className="text-amber-400 font-mono uppercase">
                  {latestFrame?.ai_prediction?.predicted_failure_mode !== "NONE"
                    ? latestFrame?.ai_prediction?.predicted_failure_mode
                    : "Steady State"}
                </span>
              </div>
            </div>

            <Link
              href="/predictions"
              className="w-full mt-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <span>Inspect SHAP Attribution</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Equipment Asset Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Monitored Critical Asset Fleet</span>
            </h3>
            <Link href="/equipment" className="text-xs text-blue-400 hover:underline">
              View Asset Catalog &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {equipmentList.map((eq) => {
              const isSelected = eq.id === selectedEquipmentId;
              return (
                <div
                  key={eq.id}
                  onClick={() => setSelectedEquipmentId(eq.id)}
                  className={`glass-panel p-5 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10 shadow-glow"
                      : "border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-400">{eq.code}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{eq.name}</h4>
                    </div>
                    <StatusBadge status={eq.status} size="sm" />
                  </div>

                  <p className="text-[11px] text-slate-400 truncate mb-4">{eq.location}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-mono">
                    <span className="text-slate-400">Health Index</span>
                    <span
                      className={`font-bold ${
                        eq.health_score > 90
                          ? "text-emerald-400"
                          : eq.health_score > 70
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {eq.health_score?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Alerts Triage Feed */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Real-Time Alert Triage Feed</span>
            </h3>
            <Link href="/alerts" className="text-xs text-blue-400 hover:underline">
              View All Alerts &rarr;
            </Link>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              Zero active alerts. All critical monitored equipment operating within nominal parameters.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        alert.severity === "CRITICAL"
                          ? "bg-rose-500 animate-ping"
                          : alert.severity === "HIGH"
                          ? "bg-orange-500"
                          : "bg-amber-400"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{alert.title}</span>
                        <StatusBadge status={alert.severity} size="sm" />
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{alert.message}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition"
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
