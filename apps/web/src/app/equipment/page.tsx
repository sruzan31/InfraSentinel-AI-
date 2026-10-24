"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Layers, Radio, Wrench, Trash2, Edit, Check, AlertCircle } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";

export default function EquipmentPage() {
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEqDetail, setSelectedEqDetail] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    equipment_type: "pump",
    quality_type: "L",
    model_number: "",
    location: "",
  });

  const loadEquipment = async () => {
    try {
      const data = await api.getEquipment({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: search || undefined,
      });
      setEquipmentList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, [statusFilter, search]);

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEquipment(formData);
      setShowAddModal(false);
      setFormData({
        name: "",
        code: "",
        equipment_type: "pump",
        quality_type: "L",
        model_number: "",
        location: "",
      });
      loadEquipment();
    } catch (err: any) {
      alert(err.message || "Failed to create equipment.");
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-400" />
              <span>Equipment Fleet Management</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Industrial machinery registry, telemetry sensors configuration, and asset topology.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Asset</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-white/5">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by asset code or name..."
              className="w-full bg-[#0B1220] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {["ALL", "OPERATIONAL", "WARNING", "CRITICAL", "MAINTENANCE"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  statusFilter === st
                    ? "bg-blue-600/30 text-blue-400 border border-blue-500/40"
                    : "bg-slate-800/40 text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Table / Grid */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1220] border-b border-white/5 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Asset Code</th>
                  <th className="py-3.5 px-4">Equipment Name</th>
                  <th className="py-3.5 px-4">Type / Variant</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Health Index</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {equipmentList.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-4 font-mono font-bold text-blue-400">
                      {eq.code}
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">
                      {eq.name}
                    </td>
                    <td className="py-4 px-4 text-slate-400 uppercase font-mono">
                      {eq.equipment_type} (Tier {eq.quality_type})
                    </td>
                    <td className="py-4 px-4 text-slate-400">{eq.location}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={eq.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 font-mono font-bold">
                      <span
                        className={
                          eq.health_score > 90
                            ? "text-emerald-400"
                            : eq.health_score > 70
                            ? "text-amber-400"
                            : "text-rose-400"
                        }
                      >
                        {eq.health_score?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedEqDetail(eq)}
                        className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-[11px] font-semibold transition"
                      >
                        Inspect Sensors
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Provision Equipment */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel bg-[#0B1220] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-1">Provision New Industrial Equipment</h3>
              <p className="text-xs text-slate-400 mb-5">
                Automatically configures 7 telemetry sensor channels and baseline envelope.
              </p>

              <form onSubmit={handleCreateEquipment} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Asset Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PUMP-501"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Variant Tier</label>
                    <select
                      value={formData.quality_type}
                      onChange={(e) => setFormData({ ...formData, quality_type: e.target.value })}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="L">L (Standard Heavy Duty)</option>
                      <option value="M">M (Medium Alloy)</option>
                      <option value="H">H (High Spec Titanium)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Equipment Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auxiliary Booster Water Pump #501"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                    <select
                      value={formData.equipment_type}
                      onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="pump">Industrial Pump</option>
                      <option value="motor">Electric Drive Motor</option>
                      <option value="compressor">Rotary Compressor</option>
                      <option value="turbine">Turbine Unit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Model Spec</label>
                    <input
                      type="text"
                      placeholder="e.g. SULZER-ZX-300"
                      value={formData.model_number}
                      onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Physical Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Station B - Cooling Loop"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow"
                  >
                    Provision Asset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Sensor Channel Inspection */}
        {selectedEqDetail && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel bg-[#0B1220] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedEqDetail.name}</span>
                    <span className="font-mono text-xs text-blue-400">({selectedEqDetail.code})</span>
                  </h3>
                  <p className="text-xs text-slate-400">Configured Sensor Telemetry Channels & Thresholds</p>
                </div>
                <button
                  onClick={() => setSelectedEqDetail(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  Close &times;
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {(selectedEqDetail.sensors || []).map((s: any) => (
                  <div key={s.id} className="p-3 bg-[#111C2E] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Type: {s.sensor_type} &bull; Unit: {s.unit}</p>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-400">Nominal: {s.min_threshold} - {s.max_threshold} {s.unit}</span>
                      <span className="text-amber-400 font-bold">Warn: &ge; {s.warning_threshold} {s.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
