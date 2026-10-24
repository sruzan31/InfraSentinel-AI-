"use client";

import { useState, useEffect } from "react";
import { Play, Pause, FastForward, Activity, ChevronDown, CheckCircle2, AlertOctagon } from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

const SCENARIOS = [
  { id: "normal", label: "Normal Baseline", color: "text-emerald-400" },
  { id: "temp_increase", label: "Thermal Dissipation (HDF)", color: "text-rose-400" },
  { id: "excessive_vibration", label: "Radial Vibration (>7 mm/s)", color: "text-amber-400" },
  { id: "pressure_instability", label: "Pressure Cavitation", color: "text-cyan-400" },
  { id: "motor_overload", label: "Motor Power Overload (PWF)", color: "text-purple-400" },
  { id: "gradual_deterioration", label: "Impeller Tool Wear (TWF)", color: "text-orange-400" },
  { id: "sensor_disconnection", label: "Sensor Signal Drop", color: "text-slate-400" },
  { id: "sudden_abnormal", label: "Sudden Seizure / Stall", color: "text-red-500 font-bold" },
];

export function SimulatorControl() {
  const {
    isSimulatorRunning,
    setSimulatorRunning,
    simulatorScenario,
    setSimulatorScenario,
    selectedEquipmentId,
    setSelectedEquipmentId,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);

  useEffect(() => {
    api.getEquipment().then(setEquipmentList).catch(console.error);
    api.getSimulatorStatus().then((s) => {
      setSimulatorRunning(s.is_running);
      setSimulatorScenario(s.current_scenario);
    }).catch(console.error);
  }, [setSimulatorRunning, setSimulatorScenario]);

  const toggleRun = async () => {
    setLoading(true);
    try {
      if (isSimulatorRunning) {
        await api.pauseSimulator();
        setSimulatorRunning(false);
      } else {
        await api.startSimulator();
        setSimulatorRunning(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioChange = async (scenario: string) => {
    try {
      await api.setSimulatorScenario(scenario);
      setSimulatorScenario(scenario);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEquipmentChange = async (id: number) => {
    try {
      await api.setSimulatorEquipment(id);
      setSelectedEquipmentId(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTick = async () => {
    try {
      await api.triggerSimulatorTick();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex items-center gap-2.5 bg-[#0F172A]/80 border border-white/10 rounded-xl px-3 py-1.5 shadow-glass-panel">
      {/* Live Pulsing Status */}
      <div className="flex items-center gap-2 pr-2 border-r border-white/10">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isSimulatorRunning ? "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" : "bg-slate-500"
          }`}
        />
        <span className="text-[11px] font-mono tracking-wider text-slate-300 font-semibold uppercase">
          {isSimulatorRunning ? "LIVE STREAM" : "PAUSED"}
        </span>
      </div>

      {/* Target Equipment Selector */}
      <select
        value={selectedEquipmentId}
        onChange={(e) => handleEquipmentChange(Number(e.target.value))}
        className="bg-[#1E293B] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
      >
        {equipmentList.map((eq) => (
          <option key={eq.id} value={eq.id}>
            {eq.code} — {eq.name.split(" ")[0]}
          </option>
        ))}
      </select>

      {/* Scenario Selector */}
      <select
        value={simulatorScenario}
        onChange={(e) => handleScenarioChange(e.target.value)}
        className="bg-[#1E293B] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
      >
        {SCENARIOS.map((s) => (
          <option key={s.id} value={s.id} className={s.color}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Start / Pause Button */}
      <button
        onClick={toggleRun}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
          isSimulatorRunning
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
            : "bg-blue-600/30 text-blue-400 border border-blue-500/40 hover:bg-blue-600/40 shadow-glow"
        }`}
      >
        {isSimulatorRunning ? (
          <>
            <Pause className="w-3.5 h-3.5" /> Pause
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" /> Stream Live
          </>
        )}
      </button>

      {/* Single Step Tick */}
      <button
        onClick={handleTick}
        title="Trigger Single Sensor Measurement Tick"
        className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 flex items-center gap-1 transition"
      >
        <FastForward className="w-3.5 h-3.5 text-cyan-400" />
        <span>Tick</span>
      </button>
    </div>
  );
}
