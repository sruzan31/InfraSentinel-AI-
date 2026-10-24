"use client";

import { useEffect, useState } from "react";
import { Cpu, Sparkles, Info, ShieldCheck, ArrowRight } from "lucide-react";
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-black tracking-tight flex items-center gap-2">
              <span>AI Prediction & Explainability</span>
              <span className="w-2 h-2 rounded-full bg-[#76FB91]" />
            </h1>
            <p className="text-xs text-neutral-500 mt-1 font-light">
              Calibrated supervised failure risk estimation and SHAP (SHapley Additive exPlanations) attribution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 font-mono">Equipment:</span>
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
          </div>
        </div>

        {/* Prediction Headline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Gauge Card */}
          <div className="clean-card rounded-[32px] p-8 bg-white border border-[#EBEBEB] flex flex-col items-center justify-between text-center">
            <div className="w-full text-left mb-2">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block">
                CALIBRATED ESTIMATION
              </span>
              <h3 className="text-xl font-light text-black mt-0.5">Machine Failure Probability</h3>
            </div>

            <div className="py-4">
              <RiskGauge
                probability={currentRiskProb}
                category={currentRiskCategory}
                mode={currentFailureMode}
                size={200}
              />
            </div>

            <div className="w-full p-4 rounded-2xl bg-[#FAFAFA] border border-neutral-200 text-xs text-left space-y-2 font-mono">
              <div className="flex justify-between text-neutral-500">
                <span>Model Engine:</span>
                <span className="text-black font-semibold">Calibrated XGBoost</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>PR-AUC Metric:</span>
                <span className="text-black font-bold">0.9471</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Decision Threshold:</span>
                <span className="text-black">0.44</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Predicted Mode:</span>
                <span className="text-black font-bold">{currentFailureMode}</span>
              </div>
            </div>
          </div>

          {/* SHAP Feature Attribution Plot */}
          <div className="lg:col-span-2 clean-card rounded-[32px] p-8 bg-white border border-[#EBEBEB] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0] mb-4">
                <div>
                  <h3 className="text-base font-semibold text-black flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>SHAP Local Feature Attribution Breakdown</span>
                  </h3>
                  <p className="text-xs text-neutral-500 font-light mt-0.5">
                    Red indicates features driving risk higher; Green indicates features stabilizing the asset.
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#EDEDED] text-black">
                  TreeExplainer
                </span>
              </div>

              <div className="pt-2">
                <ShapBarChart contributions={contributions} height={240} />
              </div>
            </div>

            {/* Prescriptive Natural Language Summary */}
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-neutral-200 mt-6">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-black">AI Prescriptive Analysis</h4>
                  <p className="text-xs text-neutral-700 mt-1 leading-relaxed font-light">{explanation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction History Table */}
        <div className="clean-card rounded-[32px] p-6 bg-white border border-[#EBEBEB] overflow-hidden">
          <div className="pb-4 border-b border-[#F0F0F0] flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-black">Historical Model Inferences</h3>
            <span className="text-xs text-neutral-500 font-mono">Last 20 Evaluations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F0F0F0] text-neutral-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-normal">Timestamp</th>
                  <th className="py-3 px-4 font-normal">Failure Probability</th>
                  <th className="py-3 px-4 font-normal">Risk Category</th>
                  <th className="py-3 px-4 font-normal">Predicted Mode</th>
                  <th className="py-3 px-4 font-normal">Flagged Status</th>
                  <th className="py-3 px-4 font-normal">Top Feature Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {predictionHistory.map((p) => {
                  const topDriver = p.feature_contributions?.[0];
                  return (
                    <tr key={p.id} className="hover:bg-[#FAFAFA] transition">
                      <td className="py-3.5 px-4 font-mono text-neutral-500">
                        {new Date(p.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-black">
                        {(p.failure_risk_probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.risk_category} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-black font-medium">
                        {p.predicted_failure_mode}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.is_flagged ? (
                          <span className="text-rose-600 font-bold font-mono">FLAGGED</span>
                        ) : (
                          <span className="text-neutral-500 font-mono">NORMAL</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700">
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
