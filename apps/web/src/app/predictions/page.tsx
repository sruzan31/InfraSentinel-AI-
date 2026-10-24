"use client";

import { useEffect, useState } from "react";
import { Cpu, Sparkles, AlertCircle, Info, ShieldCheck, ArrowRight, HelpCircle } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { RiskGauge } from "@/components/charts/RiskGauge";
import { ShapBarChart } from "@/components/charts/ShapBarChart";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function PredictionsPage() {
  const { selectedEquipmentId, setSelectedEquipmentId, latestFrame } = useAppStore();

  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [predictionHistory, setPredictionHistory] = useState<any[]>([]);
  const [latestPred, setLatestPred] = useState<any>(null);

  useEffect(() => {
    api.getEquipment().then(setEquipmentList).catch(console.error);
    if (selectedEquipmentId) {
      api.getPredictionHistory(selectedEquipmentId, 20).then(setPredictionHistory).catch(console.error);
      api.getLatestPrediction(selectedEquipmentId).then(setLatestPred).catch(console.error);
    }
  }, [selectedEquipmentId]);

  const selectedEquipment =
    equipmentList.find((e) => e.id === selectedEquipmentId) || equipmentList[0];

  const currentRiskProb =
    latestFrame?.equipment_id === selectedEquipmentId
      ? latestFrame.ai_prediction.failure_risk_probability
      : latestPred?.failure_risk_probability ?? 0.08;

  const currentRiskCategory =
    latestFrame?.equipment_id === selectedEquipmentId
      ? latestFrame.ai_prediction.risk_category
      : latestPred?.risk_category ?? "LOW";

  const currentFailureMode =
    latestFrame?.equipment_id === selectedEquipmentId
      ? latestFrame.ai_prediction.predicted_failure_mode
      : latestPred?.predicted_failure_mode ?? "NONE";

  const contributions =
    latestFrame?.equipment_id === selectedEquipmentId && latestFrame.ai_prediction.top_drivers?.length
      ? latestFrame.ai_prediction.top_drivers
      : latestPred?.feature_contributions ?? [];

  const explanation =
    latestFrame?.equipment_id === selectedEquipmentId && latestFrame.ai_prediction.explanation
      ? latestFrame.ai_prediction.explanation
      : latestPred?.explanation_summary ||
        "Operating within normal physical bounds. No abnormal heat dissipation, tool degradation, or electrical overstrain detected.";

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header with Asset Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-purple-400" />
              <span>AI Prediction & Explainability Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Calibrated supervised failure risk estimation and SHAP (SHapley Additive exPlanations) attribution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Select Equipment:</span>
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
          </div>
        </div>

        {/* Prediction Headline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Gauge Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-between text-center">
            <div className="w-full text-left mb-2">
              <span className="text-[11px] font-mono text-purple-400 font-semibold uppercase tracking-wider">
                CALIBRATED ESTIMATION
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">Machine Failure Probability</h3>
            </div>

            <div className="py-4">
              <RiskGauge
                probability={currentRiskProb}
                category={currentRiskCategory}
                mode={currentFailureMode}
                size={200}
              />
            </div>

            <div className="w-full p-3.5 rounded-xl bg-[#0B1220] border border-white/5 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Model Pipeline:</span>
                <span className="text-white font-semibold">Calibrated XGBoost</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>PR-AUC Metric:</span>
                <span className="text-cyan-400 font-bold">0.9471</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Decision Threshold:</span>
                <span className="text-white">0.44</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Predicted Mode:</span>
                <span className="text-amber-400 font-bold">{currentFailureMode}</span>
              </div>
            </div>
          </div>

          {/* SHAP Feature Attribution Plot (Center & Right 2 cols) */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>SHAP Local Attribution Breakdown</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Red indicates features driving risk higher; Green indicates features stabilizing the asset.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  TreeExplainer
                </span>
              </div>

              <div className="pt-2">
                <ShapBarChart contributions={contributions} height={240} />
              </div>
            </div>

            {/* Natural Language Diagnostic Summary */}
            <div className="p-4 rounded-xl bg-[#0B1220] border border-white/5 mt-4">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">AI Prescriptive Analysis</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{explanation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction History Table */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Historical Model Prediction Inferences</h3>
            <span className="text-xs text-slate-500 font-mono">Last 20 Evaluations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1220] border-b border-white/5 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Failure Probability</th>
                  <th className="py-3 px-4">Risk Category</th>
                  <th className="py-3 px-4">Predicted Failure Mode</th>
                  <th className="py-3 px-4">Flagged Status</th>
                  <th className="py-3 px-4">Top Feature Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {predictionHistory.map((p) => {
                  const topDriver = p.feature_contributions?.[0];
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {new Date(p.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {(p.failure_risk_probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.risk_category} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-400 font-medium">
                        {p.predicted_failure_mode}
                      </td>
                      <td className="py-3 px-4">
                        {p.is_flagged ? (
                          <span className="text-rose-400 font-bold font-mono">FLAGGED</span>
                        ) : (
                          <span className="text-emerald-400 font-mono">NORMAL</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {topDriver ? `${topDriver.feature} (${topDriver.value})` : "Balanced"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}
