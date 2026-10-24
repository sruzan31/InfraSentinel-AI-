"use client";

import { useState, useEffect } from "react";
import { Play, Pause, FastForward } from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

const SCENARIOS = [
  { id: "normal", label: "Normal Baseline" },
  { id: "temp_increase", label: "Thermal Dissipation (HDF)" },
  { id: "excessive_vibration", label: "Radial Vibration (>7 mm/s)" },
  { id: "pressure_instability", label: "Pressure Cavitation" },
  { id: "motor_overload", label: "Motor Power Overload (PWF)" },
  { id: "gradual_deterioration", label: "Impeller Tool Wear (TWF)" },
  { id: "sensor_disconnection", label: "Sensor Signal Drop" },
  { id: "sudden_abnormal", label: "Sudden Seizure / Stall" },
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
    <div className="flex items-center gap-2 bg-[#EDEDED] border border-neutral-300 rounded-full px-3 py-1 shadow-sm">
      {/* Live Pulsing Status */}
      <div className="flex items-center gap-2 pr-2 border-r border-neutral-300">
        <span
          className={`w-2 h-2 rounded-full ${
            isSimulatorRunning ? "bg-[#76FB91] shadow-[0_0_8px_#76FB91] animate-pulse" : "bg-neutral-400"
          }`}
        />
        <span className="text-[11px] font-mono tracking-wider text-black font-semibold uppercase">
          {isSimulatorRunning ? "LIVE" : "IDLE"}
        </span>
      </div>

      {/* Target Equipment Selector */}
      <select
        value={selectedEquipmentId}
        onChange={(e) => handleEquipmentChange(Number(e.target.value))}
        className="bg-white border border-neutral-300 rounded-full px-2.5 py-1 text-xs text-black focus:outline-none focus:border-black font-medium"
      >
        {equipmentList.map((eq) => (
          <option key={eq.id} value={eq.id}>
            {eq.code}
          </option>
        ))}
      </select>

      {/* Scenario Selector */}
      <select
        value={simulatorScenario}
        onChange={(e) => handleScenarioChange(e.target.value)}
        className="bg-white border border-neutral-300 rounded-full px-2.5 py-1 text-xs text-black focus:outline-none focus:border-black font-medium"
      >
        {SCENARIOS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Start / Pause Button */}
      <button
        onClick={toggleRun}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
          isSimulatorRunning
            ? "bg-amber-400 text-black hover:bg-amber-500"
            : "bg-black text-white hover:bg-neutral-800"
        }`}
      >
        {isSimulatorRunning ? (
          <>
            <Pause className="w-3.5 h-3.5" /> Pause
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" /> Stream
          </>
        )}
      </button>

      {/* Single Step Tick */}
      <button
        onClick={handleTick}
        title="Trigger Single Sensor Measurement Tick"
        className="px-2.5 py-1 rounded-full text-xs bg-white hover:bg-neutral-100 text-black border border-neutral-300 flex items-center gap-1 transition"
      >
        <FastForward className="w-3.5 h-3.5" />
        <span>Step</span>
      </button>
    </div>
  );
}
