"use client";

import { useEffect, useState } from "react";
import { Zap, Plus, Search, UserCheck, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newIncident, setNewIncident] = useState({
    equipment_id: 1,
    title: "",
    description: "",
    severity: "CRITICAL",
    priority: "P1",
  });

  const loadIncidents = async () => {
    try {
      const [incData, eqData] = await Promise.all([
        api.getIncidents({ status: statusFilter === "ALL" ? undefined : statusFilter }),
        api.getEquipment(),
      ]);
      setIncidents(incData);
      setEquipmentList(eqData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createIncident(newIncident);
      setShowCreateModal(false);
      setNewIncident({
        equipment_id: 1,
        title: "",
        description: "",
        severity: "CRITICAL",
        priority: "P1",
      });
      loadIncidents();
    } catch (e: any) {
      alert(e.message || "Failed to create incident");
    }
  };

  const handleStatusChange = async (incidentId: number, newStatus: string) => {
    try {
      const updated = await api.updateIncident(incidentId, { status: newStatus });
      setIncidents((prev) => prev.map((inc) => (inc.id === incidentId ? updated : inc)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" />
              <span>Incident Response Management</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Mission-critical failure ticketing, automated priority escalation, and technician assignment.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Open Incident Ticket</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto glass-panel p-3 rounded-xl border border-white/5">
          <span className="text-xs text-slate-400 font-mono px-2">Status:</span>
          {["ALL", "OPEN", "INVESTIGATING", "IN_PROGRESS", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                statusFilter === st
                  ? "bg-blue-600/30 text-blue-400 border border-blue-500/30"
                  : "bg-slate-800/40 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Incidents Table */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1220] border-b border-white/5 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Incident Number</th>
                  <th className="py-3.5 px-4">Title & Description</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4">Logged At</th>
                  <th className="py-3.5 px-4 text-right">Workflow Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                      No incidents matching the current filter.
                    </td>
                  </tr>
                ) : (
                  incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 px-4 font-mono font-bold text-cyan-400">
                        {inc.incident_number}
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-semibold text-white truncate">{inc.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{inc.description}</p>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={inc.severity} size="sm" />
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-amber-400">
                        {inc.priority}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={inc.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-400 text-[11px]">
                        {new Date(inc.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {inc.status === "OPEN" && (
                            <button
                              onClick={() => handleStatusChange(inc.id, "INVESTIGATING")}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-[11px] font-semibold"
                            >
                              Investigate
                            </button>
                          )}
                          {inc.status === "INVESTIGATING" && (
                            <button
                              onClick={() => handleStatusChange(inc.id, "IN_PROGRESS")}
                              className="px-2.5 py-1 rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-500/30 text-[11px] font-semibold"
                            >
                              Deploy Repair
                            </button>
                          )}
                          {inc.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleStatusChange(inc.id, "RESOLVED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-[11px] font-semibold"
                            >
                              Resolve
                            </button>
                          )}
                          {inc.status === "RESOLVED" && (
                            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Closed</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel bg-[#0B1220] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-1">Open Critical Incident Ticket</h3>
              <p className="text-xs text-slate-400 mb-5">
                Escalate an operational anomaly or failure risk to maintenance engineering.
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Affected Equipment</label>
                  <select
                    value={newIncident.equipment_id}
                    onChange={(e) => setNewIncident({ ...newIncident, equipment_id: Number(e.target.value) })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.code} &mdash; {eq.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Incident Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Excessive Bearing Vibration Spike Detected"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Severity</label>
                    <select
                      value={newIncident.severity}
                      onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="WARNING">WARNING</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                    <select
                      value={newIncident.priority}
                      onChange={(e) => setNewIncident({ ...newIncident, priority: e.target.value })}
                      className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="P1">P1 (Immediate Action)</option>
                      <option value="P2">P2 (Within 4 Hours)</option>
                      <option value="P3">P3 (Within 24 Hours)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description & SOP</label>
                  <textarea
                    rows={3}
                    placeholder="Describe observed deviations, vibration signatures, or thermal collapse..."
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow"
                  >
                    Create Ticket
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
