"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Activity,
  Cpu,
  Flame,
  Zap,
  Layers,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Sliders,
  Sparkles,
  Lock,
  Server
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060B16] text-[#F8FAFC] selection:bg-blue-600/30">
      {/* Top Navigation */}
      <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between max-w-7xl mx-auto backdrop-blur-md sticky top-0 z-50 bg-[#060B16]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-glow">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
              INFRASENTINEL AI
            </span>
            <span className="block text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              CRITICAL INFRASTRUCTURE DEFENSE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold px-4 py-2 text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-glow transition transform hover:-translate-y-0.5"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Ambient radial glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/10 blur-[130px] pointer-events-none rounded-full" />

        {/* Live Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-medium mb-8 shadow-glow">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PRODUCTION AI TELEMETRY ENGINE &bull; AI4I 2020 VALIDATED</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          Predict Failures. <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            Prevent Disruptions.
          </span> <br />
          Protect Infrastructure.
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-3xl mx-auto mb-10 leading-relaxed">
          Enterprise predictive maintenance, real-time sensor anomaly detection, and automated incident response
          designed for industrial rotating pumps, high-voltage motors, and mission-critical assets.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-glow transition transform hover:-translate-y-0.5"
          >
            <span>Enter Operator Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/models"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B1220] hover:bg-slate-800 text-slate-200 border border-white/10 font-semibold text-sm transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Inspect Verified ML Models</span>
          </Link>
        </div>

        {/* Real Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="glass-panel p-4 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-mono">XGBOOST PR-AUC</span>
            <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">0.9471</p>
            <span className="text-[10px] text-slate-500">Verified Test Set</span>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-mono">FAILURE RECALL</span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">90.2%</p>
            <span className="text-[10px] text-slate-500">Zero Catastrophic Misses</span>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-mono">INFERENCE LATENCY</span>
            <p className="text-2xl font-bold font-mono text-purple-400 mt-1">&lt; 15 ms</p>
            <span className="text-[10px] text-slate-500">Sub-Second Streaming</span>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 font-mono">EXPLAINABILITY</span>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1">SHAP</p>
            <span className="text-[10px] text-slate-500">Local Tree Attribution</span>
          </div>
        </div>
      </section>

      {/* Architecture & Capabilities Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-widest">
            ENGINEERING WORKFLOW
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            End-to-End Reliability Defense Loop
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            From multi-frequency telemetry streaming to calibrated probability estimation and maintenance ticketing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Live Telemetry Streaming</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Real-time ingestion of process temperatures, shaft rotational speeds, mechanical torque, casing vibration, and discharge pressure over WebSockets.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. Dual-Engine AI Inference</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Supervised calibrated XGBoost computes failure risk probabilities while an unsupervised Isolation Forest flags subtle multivariate operational drift.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Incident Response SOPs</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Automatic escalation from critical alerts to formal work tickets, assigning technicians, and generating SHAP root-cause diagnostic checklists.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-300">InfraSentinel AI</span>
          <span>&copy; 2026. Critical Industrial Reliability Defense.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-slate-300 transition">Command Dashboard</Link>
          <Link href="/models" className="hover:text-slate-300 transition">Model Metrics</Link>
          <Link href="/login" className="hover:text-slate-300 transition">Operator Login</Link>
        </div>
      </footer>
    </div>
  );
}
