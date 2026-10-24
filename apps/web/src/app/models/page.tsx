"use client";

import { useEffect, useState } from "react";
import { Sparkles, Database, CheckCircle2, Award, FileCode, Layers, Info } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { ShapBarChart } from "@/components/charts/ShapBarChart";
import { api } from "@/lib/api";

export default function ModelsPage() {
  const [modelData, setModelData] = useState<any>(null);
  const [activeModel, setActiveModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getModelComparisons(), api.getActiveModel()])
      .then(([comparisons, active]) => {
        setModelData(comparisons);
        setActiveModel(active);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featureImportance = (modelData?.feature_importance || []).map((f: any) => ({
    feature: f.feature,
    value: 0,
    baseline: 0,
    shap_value: f.importance,
    impact: "INCREASES_RISK",
    description: `Global mean |SHAP| value: ${f.importance.toFixed(3)}`,
  }));

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-light text-black tracking-tight flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#76FB91] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </span>
            <span>AI Model Management & Evaluation Leaderboard</span>
          </h1>
          <p className="text-xs text-black/50 mt-1">
            Empirical validation results, model versioning, and feature importance rankings on the AI4I 2020 dataset.
          </p>
        </div>

        {/* Dataset Provenance Card */}
        <div className="bg-white p-6 rounded-[28px] border border-[#CCCCCC]/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-[#EDEDED] text-black">
                <Database className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-black">AI4I 2020 Predictive Maintenance Dataset</h3>
                <p className="text-xs text-black/50">
                  UCI Machine Learning Repository &bull; Donated by Stephan Matzka, HTW Berlin (CC BY 4.0)
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-full bg-[#DFFFE6] text-[#0A5C22] border border-[#76FB91]/40">
              Verified & Tested
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
            <div className="p-4 bg-[#F7F7F8] rounded-2xl border border-[#EBEBEB]">
              <span className="text-black/50 text-[11px]">Total Observations</span>
              <p className="text-xl font-light text-black mt-1">10,000</p>
            </div>
            <div className="p-4 bg-[#F7F7F8] rounded-2xl border border-[#EBEBEB]">
              <span className="text-black/50 text-[11px]">Imbalance Ratio</span>
              <p className="text-xl font-light text-black mt-1">3.39% Failures</p>
            </div>
            <div className="p-4 bg-[#F7F7F8] rounded-2xl border border-[#EBEBEB]">
              <span className="text-black/50 text-[11px]">Splits (Zero Leakage)</span>
              <p className="text-xl font-light text-black mt-1">70 / 15 / 15</p>
            </div>
            <div className="p-4 bg-[#F7F7F8] rounded-2xl border border-[#EBEBEB]">
              <span className="text-black/50 text-[11px]">Primary Benchmark</span>
              <p className="text-xl font-medium text-black mt-1">PR-AUC</p>
            </div>
          </div>
        </div>

        {/* Model Comparison Leaderboard Table */}
        <div className="bg-white rounded-[28px] border border-[#CCCCCC]/60 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#EBEBEB] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-black flex items-center gap-2">
              <Award className="w-4 h-4 text-black" />
              <span>Model Comparison Leaderboard</span>
            </h3>
            <span className="text-[11px] font-mono text-black/50">
              Evaluated on 1,500 Holdout Test Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F7F7F8] border-b border-[#EBEBEB] text-black/60 uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Algorithm / Model</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5 text-black font-bold">PR-AUC</th>
                  <th className="py-3.5 px-5">ROC-AUC</th>
                  <th className="py-3.5 px-5">Precision</th>
                  <th className="py-3.5 px-5">Recall</th>
                  <th className="py-3.5 px-5">F1 Score</th>
                  <th className="py-3.5 px-5 text-right">Deployment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB] font-mono">
                {(modelData?.models || []).map((m: any, idx: number) => {
                  const isProduction = m.status.includes("PRODUCTION");
                  return (
                    <tr
                      key={idx}
                      className={
                        isProduction
                          ? "bg-[#DFFFE6]/30 font-semibold border-l-4 border-[#76FB91]"
                          : "hover:bg-[#F7F7F8]/80 transition"
                      }
                    >
                      <td className="py-4 px-5 text-black font-sans font-semibold">
                        {m.name}
                      </td>
                      <td className="py-4 px-5 text-black/50 text-[11px] font-sans">
                        {m.type}
                      </td>
                      <td className="py-4 px-5 text-black font-bold text-sm">
                        {m.pr_auc !== null ? m.pr_auc.toFixed(4) : "—"}
                      </td>
                      <td className="py-4 px-5 text-black/70">
                        {m.roc_auc !== null ? m.roc_auc.toFixed(4) : "—"}
                      </td>
                      <td className="py-4 px-5 text-black/70">
                        {m.precision !== null ? (m.precision * 100).toFixed(1) + "%" : "—"}
                      </td>
                      <td className="py-4 px-5 text-black font-bold">
                        {m.recall !== null ? (m.recall * 100).toFixed(1) + "%" : "—"}
                      </td>
                      <td className="py-4 px-5 text-black/70">
                        {m.f1 !== null ? m.f1.toFixed(4) : "—"}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            isProduction
                              ? "bg-[#76FB91] text-black border border-black/10"
                              : "bg-[#EDEDED] text-black/60"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global SHAP Feature Importance */}
        <div className="bg-white p-6 rounded-[28px] border border-[#CCCCCC]/60 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black" />
              <span>Global SHAP Feature Importance Attribution</span>
            </h3>
            <p className="text-xs text-black/50">
              Derived from TreeExplainer on XGBoost trees. Shows the relative magnitude of physical sensors in predicting failure modes.
            </p>
          </div>

          <ShapBarChart contributions={featureImportance} height={260} />
        </div>
      </div>
    </Shell>
  );
}
