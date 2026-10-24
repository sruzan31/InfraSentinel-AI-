"use client";

import { useEffect, useState } from "react";
import { Zap, Plus, CheckCircle2, Clock, X } from "lucide-react";
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-black tracking-tight flex items-center gap-2">
              <span>Incident Response</span>
              <span className="w-2 h-2 rounded-full bg-[#76FB91]" />
            </h1>
            <p className="text-xs text-neutral-500 mt-1 font-light">
              Mission-critical failure ticketing, automated priority escalation, and technician assignment.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#76FB91]" />
            <span>Open Incident Ticket</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto clean-card p-3 rounded-2xl bg-white border border-[#EBEBEB]">
          <span className="text-xs text-neutral-400 font-mono px-2">Status:</span>
          {["ALL", "OPEN", "INVESTIGATING", "IN_PROGRESS", "RESOLVED"].map((st) => (
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

        {/* Incidents Table */}
        <div className="clean-card rounded-[32px] p-6 bg-white border border-[#EBEBEB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F0F0F0] text-neutral-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-normal">Incident Number</th>
                  <th className="py-3 px-4 font-normal">Title & Description</th>
                  <th className="py-3 px-4 font-normal">Severity</th>
                  <th className="py-3 px-4 font-normal">Priority</th>
                  <th className="py-3 px-4 font-normal">Current Status</th>
                  <th className="py-3 px-4 font-normal">Logged At</th>
                  <th className="py-3 px-4 font-normal text-right">Workflow Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-400 font-mono">
                      No incidents matching the current filter.
                    </td>
                  </tr>
                ) : (
                  incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-[#FAFAFA] transition">
                      <td className="py-4 px-4 font-mono font-bold text-black">
                        {inc.incident_number}
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-semibold text-black truncate">{inc.title}</p>
                        <p className="text-[11px] text-neutral-500 truncate font-light">{inc.description}</p>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={inc.severity} size="sm" />
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-black">
                        {inc.priority}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={inc.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 font-mono text-neutral-500 text-[11px]">
                        {new Date(inc.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {inc.status === "OPEN" && (
                            <button
                              onClick={() => handleStatusChange(inc.id, "INVESTIGATING")}
                              className="btn-tertiary px-3 py-1 text-xs"
                            >
                              Investigate
                            </button>
                          )}
                          {inc.status === "INVESTIGATING" && (
                            <button
                              onClick={() => handleStatusChange(inc.id, "IN_PROGRESS")}
                              className="btn-secondary px-3 py-1 text-xs"
                            >
                              Deploy Repair
                            </button>
                          )}
                          {inc.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleStatusChange(inc.id, "RESOLVED")}
                              className="btn-primary px-3 py-1 text-xs"
                            >
                              Resolve
                            </button>
                          )}
                          {inc.status === "RESOLVED" && (
                            <span className="text-[11px] text-emerald-700 font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#76FB91]" />
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="clean-card bg-white border border-neutral-300 rounded-[32px] max-w-lg w-full p-8 shadow-2xl relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-light text-black mb-1">Open Critical Incident Ticket</h3>
              <p className="text-xs text-neutral-500 mb-6 font-light">
                Escalate an operational anomaly or failure risk to maintenance engineering.
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-black mb-1">Affected Equipment</label>
                  <select
                    value={newIncident.equipment_id}
                    onChange={(e) => setNewIncident({ ...newIncident, equipment_id: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFA] border border-neutral-300 rounded-2xl px-3 py-2 text-xs text-black"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.code} &mdash; {eq.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-black mb-1">Incident Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Excessive Bearing Vibration Spike Detected"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-neutral-300 rounded-2xl px-3 py-2 text-xs text-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Severity</label>
                    <select
                      value={newIncident.severity}
                      onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-neutral-300 rounded-2xl px-3 py-2 text-xs text-black"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="WARNING">WARNING</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Priority</label>
                    <select
                      value={newIncident.priority}
                      onChange={(e) => setNewIncident({ ...newIncident, priority: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-neutral-300 rounded-2xl px-3 py-2 text-xs text-black"
                    >
                      <option value="P1">P1 (Immediate Action)</option>
                      <option value="P2">P2 (Within 4 Hours)</option>
                      <option value="P3">P3 (Within 24 Hours)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-black mb-1">Description & SOP</label>
                  <textarea
                    rows={3}
                    placeholder="Describe observed deviations, vibration signatures, or thermal collapse..."
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-neutral-300 rounded-2xl px-3 py-2 text-xs text-black"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#F0F0F0]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs text-neutral-500 hover:text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2.5 text-xs font-semibold"
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
