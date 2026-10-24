"use client";

import { useEffect, useState } from "react";
import { Radio, Activity, Cpu, Flame, Sliders, AlertTriangle } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { TelemetryChart } from "@/components/charts/TelemetryChart";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function MonitoringPage() {
  const {
    selectedEquipmentId,
    setSelectedEquipmentId,
    telemetryStream,
    latestFrame,
  } = useAppStore();

  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    api.getEquipment().then(setEquipmentList).catch(console.error);
    if (selectedEquipmentId) {
      api.getTelemetryHistory(selectedEquipmentId, 50).then(setHistoryData).catch(console.error);
    }
  }, [selectedEquipmentId]);

  const selectedEquipment =
    equipmentList.find((e) => e.id === selectedEquipmentId) || equipmentList[0];

  // Merge historical readings with live streamed frames
  const displayData = telemetryStream.length > 0
    ? telemetryStream.map((f) => ({
        timestamp: f.timestamp,
        air_temp_k: f.measurements.air_temp_k,
        process_temp_k: f.measurements.process_temp_k,
        temp_diff_k: f.measurements.temp_diff_k,
        rotational_speed_rpm: f.measurements.rotational_speed_rpm,
        torque_nm: f.measurements.torque_nm,
        tool_wear_min: f.measurements.tool_wear_min,
        vibration_mms: f.measurements.vibration_mms,
        pressure_bar: f.measurements.pressure_bar,
      }))
    : historyData.map((d) => ({
        ...d,
        temp_diff_k: round(d.process_temp_k - d.air_temp_k, 2),
      }));

  function round(val: number, dec: number) {
    return Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
  }

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header with Asset Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Radio className="w-6 h-6 text-cyan-400" />
              <span>Live Sensor Telemetry Command</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Synchronized multi-channel telemetry streaming at 1Hz with dynamic threshold markers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Target Asset:</span>
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
            <StatusBadge status={selectedEquipment?.status || "OPERATIONAL"} size="sm" />
          </div>
        </div>

        {/* Live Measurement Cards Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="glass-panel p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Process Temp</span>
            <p className="text-lg font-bold font-mono text-rose-400 mt-0.5">
              {latestFrame?.measurements.process_temp_k ?? 310.5} K
            </p>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Air Temp</span>
            <p className="text-lg font-bold font-mono text-blue-400 mt-0.5">
              {latestFrame?.measurements.air_temp_k ?? 300.2} K
            </p>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">&Delta;T Thermal</span>
            <p className="text-lg font-bold font-mono text-amber-400 mt-0.5">
              {latestFrame?.measurements.temp_diff_k ?? 10.3} K
            </p>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Shaft Speed</span>
            <p className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
              {latestFrame?.measurements.rotational_speed_rpm ?? 1538} RPM
            </p>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Torque</span>
            <p className="text-lg font-bold font-mono text-purple-400 mt-0.5">
              {latestFrame?.measurements.torque_nm ?? 40.0} Nm
            </p>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Radial Vib</span>
            <p className="text-lg font-bold font-mono text-red-400 mt-0.5">
              {latestFrame?.measurements.vibration_mms ?? 2.4} mm/s
            </p>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Pressure</span>
            <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {latestFrame?.measurements.pressure_bar ?? 4.2} bar
            </p>
          </div>
        </div>

        {/* 3 Telemetry Graphs */}
        <div className="grid grid-cols-1 gap-6">
          {/* 1. Thermal Gradient */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white">Thermal Dissipation Spectrum</h3>
                <p className="text-xs text-slate-400">
                  Process Fluid Temp vs Air Temp. Warning triggered when &Delta;T falls below 8.6 K at low RPM.
                </p>
              </div>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                Threshold: &Delta;T &lt; 8.6 K
              </span>
            </div>
            <TelemetryChart data={displayData} metricType="temperature" height={220} />
          </div>

          {/* 2. Mechanical Powertrain */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white">Electromechanical Powertrain</h3>
                <p className="text-xs text-slate-400">
                  Rotational Speed (RPM) and Shaft Torque (Nm). Power calculated via $P = \tau \times \omega$.
                </p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                Nominal: 1530 RPM &bull; 40 Nm
              </span>
            </div>
            <TelemetryChart data={displayData} metricType="mechanical" height={220} />
          </div>

          {/* 3. Dynamics: Vibration & Pressure */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white">Vibrational & Hydraulic Dynamics</h3>
                <p className="text-xs text-slate-400">
                  Casing Radial Vibration (mm/s ISO 10816 Zone D &gt; 7.0 mm/s) and Discharge Pressure (bar).
                </p>
              </div>
              <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                ISO Danger Limit: &gt; 7.0 mm/s
              </span>
            </div>
            <TelemetryChart data={displayData} metricType="dynamics" height={220} />
          </div>
        </div>
      </div>
    </Shell>
  );
}
