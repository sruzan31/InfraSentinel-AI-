"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Layers, Radio, Wrench, X } from "lucide-react";
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-black tracking-tight flex items-center gap-2">
              <span>Equipment Fleet</span>
              <span className="w-2 h-2 rounded-full bg-[#76FB91]" />
            </h1>
            <p className="text-xs text-neutral-500 mt-1 font-light">
              Industrial machinery registry, sensor telemetry configurations, and asset topology.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#76FB91]" />
            <span>Provision New Asset</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 clean-card p-4 rounded-2xl bg-white border border-[#EBEBEB]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code or equipment..."
              className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-full pl-10 pr-4 py-2 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {["ALL", "OPERATIONAL", "WARNING", "CRITICAL", "MAINTENANCE"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  statusFilter === st
                    ? "bg-black text-white"
                    : "bg-[#EDEDED] text-black hover:bg-neutral-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Table */}
        <div className="clean-card rounded-[32px] p-6 bg-white border border-[#EBEBEB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F0F0F0] text-neutral-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-normal">Asset Code</th>
                  <th className="py-3 px-4 font-normal">Equipment Name</th>
                  <th className="py-3 px-4 font-normal">Type / Variant</th>
                  <th className="py-3 px-4 font-normal">Location</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal">Health Index</th>
                  <th className="py-3 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {equipmentList.map((eq) => (
                  <tr key={eq.id} className="hover:bg-[#FAFAFA] transition">
                    <td className="py-4 px-4 font-mono font-bold text-black">{eq.code}</td>
                    <td className="py-4 px-4 font-medium text-black">{eq.name}</td>
                    <td className="py-4 px-4 text-neutral-500 font-mono uppercase">
                      {eq.equipment_type} (Tier {eq.quality_type})
                    </td>
                    <td className="py-4 px-4 text-neutral-600">{eq.location}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={eq.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-black">
                      {eq.health_score?.toFixed(1)}%
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedEqDetail(eq)}
                        className="btn-tertiary px-3 py-1 text-xs"
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

        {/* Provision Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="clean-card bg-white border border-neutral-300 rounded-[32px] max-w-lg w-full p-8 shadow-2xl relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-light text-black mb-1">Provision Industrial Asset</h3>
              <p className="text-xs text-neutral-500 mb-6 font-light">
                Registers new physical machinery and configures 7-channel condition telemetry.
              </p>

              <form onSubmit={handleCreateEquipment} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Asset Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PUMP-501"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full bg-[#FAFAFA] border border-neutral-300 rounded-2xl px-3 py-2 text-xs text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Variant Tier</label>
                    <select
                      value={formData.quality_type}
                      onChange={(e) => setFormData({ ...formData, quality_type: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-neutral-300 rounded-2xl px-3 py-2 text-xs text-black"
                    >
                      <option value="L">L (Standard Heavy Duty)</option>
                      <option value="M">M (Medium Alloy)</option>
                      <option value="H">H (High Spec Titanium)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-black mb-1">Equipment Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auxiliary Booster Water Pump #501"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-neutral-300 rounded-2xl px-3 py-2 text-xs text-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Type</label>
                    <select
                      value={formData.equipment_type}
                      onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-neutral-300 rounded-2xl px-3 py-2 text-xs text-black"
                    >
                      <option value="pump">Industrial Pump</option>
                      <option value="motor">Electric Drive Motor</option>
                      <option value="compressor">Rotary Compressor</option>
                      <option value="turbine">Turbine Unit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Model Spec</label>
                    <input
                      type="text"
                      placeholder="e.g. SULZER-ZX-300"
                      value={formData.model_number}
                      onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-neutral-300 rounded-2xl px-3 py-2 text-xs text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-black mb-1">Physical Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Station B - Cooling Loop"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-neutral-300 rounded-2xl px-3 py-2 text-xs text-black"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#F0F0F0]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs text-neutral-500 hover:text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2.5 text-xs font-semibold"
                  >
                    Provision Asset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Inspect Sensors Modal */}
        {selectedEqDetail && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="clean-card bg-white border border-neutral-300 rounded-[32px] max-w-2xl w-full p-8 shadow-2xl relative">
              <button
                onClick={() => setSelectedEqDetail(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-light text-black flex items-center gap-2">
                  <span>{selectedEqDetail.name}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#EDEDED] text-black">
                    {selectedEqDetail.code}
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Active Telemetry Channels, Envelope Bounds & Warning Limits
                </p>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {(selectedEqDetail.sensors || []).map((s: any) => (
                  <div
                    key={s.id}
                    className="p-3.5 bg-[#FAFAFA] rounded-2xl border border-neutral-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-black">{s.name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        Channel: {s.sensor_type} &bull; Unit: {s.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-neutral-500">
                        {s.min_threshold} - {s.max_threshold} {s.unit}
                      </span>
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Warn: &ge; {s.warning_threshold} {s.unit}
                      </span>
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
