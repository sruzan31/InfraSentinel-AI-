"use client";

import { useEffect, useState } from "react";
import { Radio, Activity, Cpu, Sliders } from "lucide-react";
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-black tracking-tight flex items-center gap-2">
              <span>Live Sensor Telemetry</span>
              <span className="w-2 h-2 rounded-full bg-[#76FB91]" />
            </h1>
            <p className="text-xs text-neutral-500 mt-1 font-light">
              High-frequency multi-channel telemetry streaming at 1Hz with dynamic threshold markers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 font-mono">Target:</span>
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
            <StatusBadge status={selectedEquipment?.status || "OPERATIONAL"} size="sm" />
          </div>
        </div>

        {/* Live Measurement Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="clean-card p-4 rounded-2xl bg-white border border-[#EBEBEB] text-center">
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Process Temp</span>
            <p className="text-xl font-light text-black mt-1 font-mono">
              {latestFrame?.measurements.process_temp_k ?? 310.5} K
            </p>
          </div>
          <div className="clean-card p-4 rounded-2xl bg-white border border-[#EBEBEB] text-center">
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Air Temp</span>
            <p className="text-xl font-light text-neutral-600 mt-1 font-mono">
              {latestFrame?.measurements.air_temp_k ?? 300.2} K
            </p>
          </div>
          <div className="clean-card p-4 rounded-2xl bg-white border border-[#EBEBEB] text-center">
            <span className="text-[10px] text-neutral-500 uppercase font-mono">&Delta;T Thermal</span>
            <p className="text-xl font-light text-amber-600 mt-1 font-mono">
              {latestFrame?.measurements.temp_diff_k ?? 10.3} K
            </p>
          </div>
          <div className="clean-card p-4 rounded-2xl bg-white border border-[#EBEBEB] text-center">
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Shaft Speed</span>
            <p className="text-xl font-light text-black mt-1 font-mono">
              {latestFrame?.measurements.rotational_speed_rpm ?? 1538} RPM
            </p>
          </div>
          <div className="clean-card p-4 rounded-2xl bg-white border border-[#EBEBEB] text-center">
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Torque Load</span>
            <p className="text-xl font-light text-black mt-1 font-mono">
              {latestFrame?.measurements.torque_nm ?? 40.0} Nm
            </p>
          </div>
          <div className="clean-card p-4 rounded-2xl bg-white border border-[#EBEBEB] text-center">
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Radial Vib</span>
            <p className="text-xl font-light text-rose-600 mt-1 font-mono">
              {latestFrame?.measurements.vibration_mms ?? 2.4} mm/s
            </p>
          </div>
          <div className="clean-card p-4 rounded-2xl bg-white border border-[#EBEBEB] text-center">
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Pressure</span>
            <p className="text-xl font-light text-black mt-1 font-mono">
              {latestFrame?.measurements.pressure_bar ?? 4.2} bar
            </p>
          </div>
        </div>

        {/* 3 Telemetry Graphs */}
        <div className="grid grid-cols-1 gap-6">
          {/* 1. Thermal Gradient */}
          <div className="clean-card rounded-[32px] p-6 md:p-8 bg-white border border-[#EBEBEB]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0F0F0] gap-2 mb-4">
              <div>
                <h3 className="text-base font-semibold text-black">Thermal Dissipation Spectrum</h3>
                <p className="text-xs text-neutral-500 font-light">
                  Process Fluid Temp vs Ambient Air Temp. Warning triggered when &Delta;T &lt; 8.6 K at low RPM.
                </p>
              </div>
              <span className="text-xs font-mono text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                HDF Limit: &Delta;T &lt; 8.6 K
              </span>
            </div>
            <TelemetryChart data={displayData} metricType="temperature" height={240} />
          </div>

          {/* 2. Electromechanical Powertrain */}
          <div className="clean-card rounded-[32px] p-6 md:p-8 bg-white border border-[#EBEBEB]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0F0F0] gap-2 mb-4">
              <div>
                <h3 className="text-base font-semibold text-black">Electromechanical Powertrain</h3>
                <p className="text-xs text-neutral-500 font-light">
                  Rotational Speed (RPM) and Shaft Torque (Nm). Nominal power: 1530 RPM &bull; 40 Nm.
                </p>
              </div>
              <span className="text-xs font-mono text-black bg-[#EDEDED] border border-neutral-300 px-3 py-1 rounded-full">
                Power: &tau; &times; &omega;
              </span>
            </div>
            <TelemetryChart data={displayData} metricType="mechanical" height={240} />
          </div>

          {/* 3. Dynamics: Vibration & Pressure */}
          <div className="clean-card rounded-[32px] p-6 md:p-8 bg-white border border-[#EBEBEB]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0F0F0] gap-2 mb-4">
              <div>
                <h3 className="text-base font-semibold text-black">Vibrational & Hydraulic Dynamics</h3>
                <p className="text-xs text-neutral-500 font-light">
                  Casing Radial Vibration (mm/s ISO 10816 Zone D &gt; 7.0 mm/s) and Discharge Pressure (bar).
                </p>
              </div>
              <span className="text-xs font-mono text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                Danger Zone: &gt; 7.0 mm/s
              </span>
            </div>
            <TelemetryChart data={displayData} metricType="dynamics" height={240} />
          </div>
        </div>
      </div>
    </Shell>
  );
}
