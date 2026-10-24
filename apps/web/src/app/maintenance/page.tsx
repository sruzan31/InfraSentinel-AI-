"use client";

import { useEffect, useState } from "react";
import { Wrench, CheckCircle, Clock, Plus, DollarSign, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function MaintenancePage() {
  const { selectedEquipmentId, setSelectedEquipmentId } = useAppStore();

  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);

  const [logForm, setLogForm] = useState({
    maintenance_type: "PREVENTIVE",
    technician_name: "Elena Vance (Reliability Engineer)",
    actions_performed: "",
    parts_replaced: "",
    downtime_minutes: 45,
    cost: 450.0,
  });

  const loadData = async () => {
    try {
      const [eqData, recData, recsData] = await Promise.all([
        api.getEquipment(),
        api.getMaintenanceRecommendations(selectedEquipmentId),
        api.getMaintenanceRecords(),
      ]);
      setEquipmentList(eqData);
      setRecommendations(recData);
      setRecords(recsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedEquipmentId]);

  const handleLogMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMaintenanceRecord({
        equipment_id: selectedEquipmentId,
        ...logForm,
      });
      setShowLogModal(false);
      setLogForm({
        maintenance_type: "PREVENTIVE",
        technician_name: "Elena Vance (Reliability Engineer)",
        actions_performed: "",
        parts_replaced: "",
        downtime_minutes: 45,
        cost: 450.0,
      });
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to log maintenance.");
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-black tracking-tight flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#DFFFE6] flex items-center justify-center text-black">
                <Wrench className="w-5 h-5 text-black" />
              </span>
              <span>Maintenance Intelligence & SOPs</span>
            </h1>
            <p className="text-xs text-black/50 mt-1">
              AI-driven inspection checklists, work order logs, and reliability history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(Number(e.target.value))}
              aria-label="Filter equipment for maintenance"
              className="bg-white border border-[#CCCCCC] rounded-full px-4 py-2 text-xs text-black focus:outline-none focus:border-black font-medium shadow-sm"
            >
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.code} &mdash; {eq.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-black/85 text-white font-medium text-xs transition shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#76FB91]" />
              <span>Log Maintenance Action</span>
            </button>
          </div>
        </div>

        {/* AI Prescriptive Checklist Card */}
        <div className="bg-white p-6 rounded-[28px] border border-[#CCCCCC]/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#76FB91] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-black">
                  Prescriptive Inspection Tasks: {recommendations?.equipment_name}
                </h3>
                <p className="text-xs text-black/50">
                  Priority checklist synthesized from calibrated failure risk and SHAP stress vectors.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-full bg-[#EDEDED] text-black border border-[#CCCCCC]">
              Urgency: {recommendations?.urgency || "NORMAL"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {(recommendations?.recommended_tasks || []).map((t: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#F7F7F8] border border-[#EBEBEB] flex items-start gap-3 hover:border-black/20 transition"
              >
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-black">{t.task}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DFFFE6] text-[#0A5C22] font-semibold border border-[#76FB91]/40">
                      {t.priority}
                    </span>
                  </div>
                  <span className="text-[11px] text-black/50 font-mono block mt-1">
                    Est. Duration: {t.estimated_hours}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Work Orders */}
        <div className="bg-white rounded-[28px] border border-[#CCCCCC]/60 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#EBEBEB] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-black">Historical Maintenance Work Orders</h3>
            <span className="text-xs font-mono text-black/50">Audit Verified</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F8] border-b border-[#EBEBEB] text-black/60 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-5">Date Performed</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Technician</th>
                  <th className="py-3 px-5">Actions Performed</th>
                  <th className="py-3 px-5">Parts Replaced</th>
                  <th className="py-3 px-5">Downtime</th>
                  <th className="py-3 px-5 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB] font-sans">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-black/40 font-mono">
                      No maintenance work orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F7F7F8]/80 transition">
                      <td className="py-3.5 px-5 font-mono text-black/60">
                        {new Date(r.performed_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 font-mono font-semibold text-black">
                        <span className="px-2.5 py-1 rounded-full bg-[#EDEDED] text-black text-[11px]">
                          {r.maintenance_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-black font-medium">
                        {r.technician_name}
                      </td>
                      <td className="py-3.5 px-5 text-black/70 max-w-xs truncate">
                        {r.actions_performed}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-black/60">
                        {r.parts_replaced || "None"}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-black">
                        {r.downtime_minutes} min
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-black">
                        ${r.cost.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Log Maintenance Modal */}
        {showLogModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#CCCCCC] rounded-[32px] max-w-lg w-full p-6 shadow-2xl">
              <h3 className="text-xl font-light text-black tracking-tight mb-1">Log Maintenance Work Order</h3>
              <p className="text-xs text-black/50 mb-5">
                Records maintenance activity, resets asset health index, and updates MTBF.
              </p>

              <form onSubmit={handleLogMaintenance} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-black/70 mb-1">Maintenance Type</label>
                    <select
                      value={logForm.maintenance_type}
                      onChange={(e) => setLogForm({ ...logForm, maintenance_type: e.target.value })}
                      aria-label="Maintenance Type"
                      className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                    >
                      <option value="PREVENTIVE">PREVENTIVE</option>
                      <option value="CORRECTIVE">CORRECTIVE</option>
                      <option value="EMERGENCY">EMERGENCY</option>
                      <option value="INSPECTION">INSPECTION</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/70 mb-1">Technician Name</label>
                    <input
                      type="text"
                      required
                      value={logForm.technician_name}
                      onChange={(e) => setLogForm({ ...logForm, technician_name: e.target.value })}
                      className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1">Actions Performed</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Replaced worn casing bearing and flushed cooling jacket..."
                    value={logForm.actions_performed}
                    onChange={(e) => setLogForm({ ...logForm, actions_performed: e.target.value })}
                    className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1">Parts Replaced</label>
                  <input
                    type="text"
                    placeholder="e.g. SKF Roller Bearing 22216, Viton Shaft Seal"
                    value={logForm.parts_replaced}
                    onChange={(e) => setLogForm({ ...logForm, parts_replaced: e.target.value })}
                    className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-black/70 mb-1">Downtime (Minutes)</label>
                    <input
                      type="number"
                      value={logForm.downtime_minutes}
                      onChange={(e) => setLogForm({ ...logForm, downtime_minutes: Number(e.target.value) })}
                      className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/70 mb-1">Cost ($ USD)</label>
                    <input
                      type="number"
                      value={logForm.cost}
                      onChange={(e) => setLogForm({ ...logForm, cost: Number(e.target.value) })}
                      className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#EBEBEB]">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 text-xs text-black/60 hover:text-black font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-black hover:bg-black/85 text-white text-xs font-medium shadow-sm transition"
                  >
                    Record Work Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
