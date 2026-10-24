"use client";

import { useEffect, useState } from "react";
import { Wrench, CheckCircle, Clock, Plus, DollarSign, ShieldAlert, Sparkles } from "lucide-react";
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
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Wrench className="w-6 h-6 text-emerald-400" />
              <span>Maintenance Intelligence & SOPs</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              AI-driven inspection checklists, work order logs, and reliability history.
            </p>
          </div>

          <div className="flex items-center gap-3">
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

            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log Maintenance Action</span>
            </button>
          </div>
        </div>

        {/* AI Prescriptive Checklist Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Prescriptive Inspection Tasks: {recommendations?.equipment_name}
                </h3>
                <p className="text-xs text-slate-400">
                  Priority checklist synthesized from calibrated failure risk and SHAP stress vectors.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Urgency: {recommendations?.urgency}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {(recommendations?.recommended_tasks || []).map((t: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0B1220] border border-white/5 flex items-start gap-3 hover:border-white/20 transition"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{t.task}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                      {t.priority}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    Est. Duration: {t.estimated_hours}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Work Orders */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Historical Maintenance Work Orders</h3>
            <span className="text-xs font-mono text-slate-400">Audit Verified</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1220] border-b border-white/5 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date Performed</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Actions Performed</th>
                  <th className="py-3 px-4">Parts Replaced</th>
                  <th className="py-3 px-4">Downtime</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                      No maintenance work orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {new Date(r.performed_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-400">
                        {r.maintenance_type}
                      </td>
                      <td className="py-3.5 px-4 text-white font-medium">
                        {r.technician_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                        {r.actions_performed}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {r.parts_replaced || "None"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-amber-400">
                        {r.downtime_minutes} min
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel bg-[#0B1220] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-1">Log Maintenance Work Order</h3>
              <p className="text-xs text-slate-400 mb-5">
                Records maintenance activity, resets asset health index, and updates MTBF.
              </p>

              <form onSubmit={handleLogMaintenance} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Maintenance Type</label>
                    <select
                      value={logForm.maintenance_type}
                      onChange={(e) => setLogForm({ ...logForm, maintenance_type: e.target.value })}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="PREVENTIVE">PREVENTIVE</option>
                      <option value="CORRECTIVE">CORRECTIVE</option>
                      <option value="EMERGENCY">EMERGENCY</option>
                      <option value="INSPECTION">INSPECTION</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Technician Name</label>
                    <input
                      type="text"
                      required
                      value={logForm.technician_name}
                      onChange={(e) => setLogForm({ ...logForm, technician_name: e.target.value })}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Actions Performed</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Replaced worn casing bearing and flushed cooling jacket..."
                    value={logForm.actions_performed}
                    onChange={(e) => setLogForm({ ...logForm, actions_performed: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Parts Replaced</label>
                  <input
                    type="text"
                    placeholder="e.g. SKF Roller Bearing 22216, Viton Shaft Seal"
                    value={logForm.parts_replaced}
                    onChange={(e) => setLogForm({ ...logForm, parts_replaced: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Downtime (Minutes)</label>
                    <input
                      type="number"
                      value={logForm.downtime_minutes}
                      onChange={(e) => setLogForm({ ...logForm, downtime_minutes: Number(e.target.value) })}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Cost ($ USD)</label>
                    <input
                      type="number"
                      value={logForm.cost}
                      onChange={(e) => setLogForm({ ...logForm, cost: Number(e.target.value) })}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow"
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
