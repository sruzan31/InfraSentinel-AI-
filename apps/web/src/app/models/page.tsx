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
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>AI Model Management & Evaluation Leaderboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Empirical validation results, model versioning, and feature importance rankings on the AI4I 2020 dataset.
          </p>
        </div>

        {/* Dataset Provenance Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI4I 2020 Predictive Maintenance Dataset</h3>
                <p className="text-xs text-slate-400">
                  UCI Machine Learning Repository &bull; Donated by Stephan Matzka, HTW Berlin (CC BY 4.0)
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Verified & Tested
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
            <div className="p-3 bg-[#0B1220] rounded-xl border border-white/5">
              <span className="text-slate-500">Total Observations</span>
              <p className="text-base font-bold text-white mt-0.5">10,000 Records</p>
            </div>
            <div className="p-3 bg-[#0B1220] rounded-xl border border-white/5">
              <span className="text-slate-500">Imbalance Ratio</span>
              <p className="text-base font-bold text-white mt-0.5">3.39% Failures</p>
            </div>
            <div className="p-3 bg-[#0B1220] rounded-xl border border-white/5">
              <span className="text-slate-500">Splits (Zero Leakage)</span>
              <p className="text-base font-bold text-cyan-400 mt-0.5">70% / 15% / 15%</p>
            </div>
            <div className="p-3 bg-[#0B1220] rounded-xl border border-white/5">
              <span className="text-slate-500">Primary Benchmark Metric</span>
              <p className="text-base font-bold text-emerald-400 mt-0.5">PR-AUC</p>
            </div>
          </div>
        </div>

        {/* Model Comparison Leaderboard Table */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Model Comparison Leaderboard</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Evaluated on 1,500 Holdout Test Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0B1220] border-b border-white/5 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Algorithm / Model</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-cyan-400 font-bold">PR-AUC</th>
                  <th className="py-3.5 px-4">ROC-AUC</th>
                  <th className="py-3.5 px-4">Precision</th>
                  <th className="py-3.5 px-4">Recall</th>
                  <th className="py-3.5 px-4">F1 Score</th>
                  <th className="py-3.5 px-4 text-right">Deployment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {(modelData?.models || []).map((m: any, idx: number) => {
                  const isProduction = m.status.includes("PRODUCTION");
                  return (
                    <tr
                      key={idx}
                      className={
                        isProduction
                          ? "bg-blue-600/10 font-bold border-l-2 border-blue-500"
                          : "hover:bg-slate-800/30"
                      }
                    >
                      <td className="py-4 px-4 text-white font-sans font-semibold">
                        {m.name}
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-[11px] font-sans">
                        {m.type}
                      </td>
                      <td className="py-4 px-4 text-cyan-400 font-bold text-sm">
                        {m.pr_auc !== null ? m.pr_auc.toFixed(4) : "—"}
                      </td>
                      <td className="py-4 px-4 text-white">
                        {m.roc_auc !== null ? m.roc_auc.toFixed(4) : "—"}
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {m.precision !== null ? (m.precision * 100).toFixed(1) + "%" : "—"}
                      </td>
                      <td className="py-4 px-4 text-emerald-400 font-bold">
                        {m.recall !== null ? (m.recall * 100).toFixed(1) + "%" : "—"}
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {m.f1 !== null ? m.f1.toFixed(4) : "—"}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isProduction
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_#34d399]"
                              : "bg-slate-800 text-slate-400"
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
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Global SHAP Feature Importance Attribution</span>
            </h3>
            <p className="text-xs text-slate-400">
              Derived from TreeExplainer on XGBoost trees. Shows the relative magnitude of physical sensors in predicting failure modes.
            </p>
          </div>

          <ShapBarChart contributions={featureImportance} height={260} />
        </div>
      </div>
    </Shell>
  );
}
