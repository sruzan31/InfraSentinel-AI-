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
  CheckCircle2,
  Sparkles,
  Radio,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  Check,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#76FB91] selection:text-black">
      {/* Floating Minimal Navigation Bar */}
      <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
        <header className="bg-white/90 backdrop-blur-md border border-[#E5E5E5] px-6 py-3 rounded-full flex items-center justify-between gap-8 shadow-soft-card max-w-4xl w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#76FB91] flex items-center justify-center text-black shadow-sm">
              <ShieldCheck className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-base tracking-tight text-black flex items-center gap-1">
              <span>InfraSentinel</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#76FB91]" />
            </span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#444444]">
            <a href="#platform" className="hover:text-black transition">Platform</a>
            <a href="#features" className="hover:text-black transition">Features</a>
            <a href="#workflow" className="hover:text-black transition">How It Works</a>
            <Link href="/models" className="hover:text-black transition flex items-center gap-1">
              <span>ML Models</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#DFFFE6] text-black font-mono">0.947 PR</span>
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="text-xs font-medium px-4 py-2 text-[#444444] hover:text-black transition"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="btn-secondary px-5 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-pill-glow"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-[1440px] mx-auto text-center relative overflow-hidden">
        {/* Soft neon green blurred background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[750px] h-[450px] green-subtle-glow rounded-full pointer-events-none -z-10" />

        {/* Status Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDEDED] border border-neutral-300 text-black text-xs font-mono font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-[#76FB91] shadow-[0_0_6px_#76FB91] animate-pulse" />
          <span>PRODUCTION AI RELIABILITY CORE &bull; AI4I 2020 VALIDATED</span>
        </div>

        {/* Oversized Editorial Heading */}
        <h1 className="hero-title font-light text-black tracking-tighter max-w-5xl mx-auto mb-6">
          Predict <span className="font-normal">Failures.</span>
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 font-normal">Prevent Disruptions.</span>
            <span className="absolute inset-x-0 bottom-2 md:bottom-4 h-5 md:h-8 bg-[#76FB91] -z-0 opacity-80 rounded-sm -rotate-1 scale-105" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-[#555555] text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          AI-powered infrastructure intelligence that transforms real-time sensor streams into actionable operational insights.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="btn-primary px-8 py-3.5 text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="btn-tertiary px-8 py-3.5 text-sm font-medium flex items-center gap-2"
          >
            <span>Explore Platform</span>
          </a>
        </div>

        {/* Interactive Hero Visualization Card */}
        <div className="max-w-5xl mx-auto clean-card rounded-[32px] p-6 md:p-8 bg-white border border-[#E5E5E5] relative shadow-soft-card text-left overflow-hidden">
          {/* Subtle green top gradient accent line */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#76FB91] to-transparent" />

          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F0F0F0] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#76FB91] animate-pulse" />
                <h3 className="text-base font-bold text-black font-sans">
                  PUMP-101 &bull; Centrifugal Slurry Pump Loop
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Primary Clarifier Bay A &bull; Ingesting 7 Telemetry Channels at 1Hz
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1 rounded-full bg-[#DFFFE6] text-black font-medium border border-[#76FB91]/40">
                Operating Nominally
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-[#EDEDED] text-black font-mono font-bold">
                Health: 98.5%
              </span>
            </div>
          </div>

          {/* Minimalist SVG Telemetry Wave & Nodes */}
          <div className="py-8 relative">
            <svg viewBox="0 0 800 160" className="w-full h-32 stroke-current overflow-visible">
              {/* Reference Grid lines */}
              <line x1="0" y1="40" x2="800" y2="40" stroke="#F0F0F0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="800" y2="80" stroke="#F0F0F0" strokeWidth="1" />
              <line x1="0" y1="120" x2="800" y2="120" stroke="#F0F0F0" strokeWidth="1" strokeDasharray="4 4" />

              {/* Sine Wave 1 (Process Temperature) */}
              <path
                d="M 0 90 Q 100 50, 200 85 T 400 80 T 600 70 T 800 85"
                fill="none"
                stroke="#000000"
                strokeWidth="2.5"
              />

              {/* Sine Wave 2 (Neon Green Telemetry Signal) */}
              <path
                d="M 0 75 Q 100 110, 200 70 T 400 65 T 600 100 T 800 70"
                fill="none"
                stroke="#76FB91"
                strokeWidth="3"
              />

              {/* Interactive Sensor Nodes */}
              <circle cx="200" cy="70" r="5" fill="#000000" stroke="#76FB91" strokeWidth="3" />
              <circle cx="400" cy="65" r="5" fill="#76FB91" stroke="#000000" strokeWidth="2" />
              <circle cx="600" cy="100" r="5" fill="#000000" stroke="#76FB91" strokeWidth="3" />
            </svg>

            {/* Floating AI Insight Pill Overlay */}
            <div className="absolute right-6 top-6 bg-white/95 border border-[#E5E5E5] px-4 py-2.5 rounded-2xl shadow-soft-card max-w-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-black">
                <Sparkles className="w-3.5 h-3.5 text-[#000000]" />
                <span>AI Failure Risk: 2.1%</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Thermal dissipation and vibration envelopes calibrated. Zero breakdown risk detected.
              </p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-[#F0F0F0] text-center">
            <div className="p-3 bg-[#FAFAFA] rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-mono">Process Temp</span>
              <p className="text-sm font-bold text-black mt-0.5 font-mono">310.2 K</p>
            </div>
            <div className="p-3 bg-[#FAFAFA] rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-mono">Shaft Speed</span>
              <p className="text-sm font-bold text-black mt-0.5 font-mono">1538 RPM</p>
            </div>
            <div className="p-3 bg-[#FAFAFA] rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-mono">Torque Load</span>
              <p className="text-sm font-bold text-black mt-0.5 font-mono">40.2 Nm</p>
            </div>
            <div className="p-3 bg-[#FAFAFA] rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-mono">Radial Vibration</span>
              <p className="text-sm font-bold text-black mt-0.5 font-mono">2.4 mm/s</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Asymmetric Modern Layout) */}
      <section id="features" className="py-24 px-6 max-w-[1440px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest uppercase text-neutral-500">
            SYSTEM CAPABILITIES
          </span>
          <h2 className="section-title font-light text-black mt-2">
            Engineered for <span className="font-normal underline decoration-[#76FB91] decoration-4">Zero Downtime</span>
          </h2>
          <p className="text-[#666666] text-base mt-4 font-light">
            Comprehensive condition monitoring with explainable ML models and automated incident escalation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="clean-card rounded-[32px] p-8 border border-[#E5E5E5] flex flex-col justify-between hover:border-black/30">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#DFFFE6] border border-[#76FB91] flex items-center justify-center text-black mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-light text-black mb-3">1. Predictive Maintenance</h3>
              <p className="text-[#555555] text-sm leading-relaxed font-light">
                Calibrated XGBoost models compute exact machine failure probabilities up to shifts ahead of unplanned mechanical breakdowns.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#F0F0F0] text-xs font-mono text-black font-medium">
              PR-AUC 0.9471 &bull; 90.2% Recall
            </div>
          </div>

          {/* Feature 2: Highlight Card with Neon Green Gradient */}
          <div className="green-accent-gradient rounded-[32px] p-8 border border-[#76FB91]/60 flex flex-col justify-between shadow-soft-card">
            <div>
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-6">
                <Flame className="w-6 h-6 text-[#76FB91]" />
              </div>
              <h3 className="text-2xl font-normal text-black mb-3">2. Anomaly Detection</h3>
              <p className="text-black/80 text-sm leading-relaxed font-normal">
                Unsupervised Isolation Forest trained exclusively on healthy baselines identifies subtle multivariable operational drift before alarms trip.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-black/10 text-xs font-mono text-black font-bold">
              Unsupervised Out-of-Distribution Scoring
            </div>
          </div>

          {/* Feature 3 */}
          <div className="clean-card rounded-[32px] p-8 border border-[#E5E5E5] flex flex-col justify-between hover:border-black/30">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#EDEDED] border border-neutral-300 flex items-center justify-center text-black mb-6">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-light text-black mb-3">3. Real-Time Telemetry</h3>
              <p className="text-[#555555] text-sm leading-relaxed font-light">
                High-frequency WebSocket stream broadcasting temperatures, rotational RPM, torque, casing vibration, and pressure envelopes.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#F0F0F0] text-xs font-mono text-black font-medium">
              Sub-15ms Ingestion Latency
            </div>
          </div>

          {/* Feature 4 */}
          <div className="clean-card rounded-[32px] p-8 border border-[#E5E5E5] flex flex-col justify-between hover:border-black/30">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#EDEDED] border border-neutral-300 flex items-center justify-center text-black mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-light text-black mb-3">4. Explainable AI (SHAP)</h3>
              <p className="text-[#555555] text-sm leading-relaxed font-light">
                TreeExplainer local attribution pinpoints the exact physical sensor deviations causing elevated risk vectors.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#F0F0F0] text-xs font-mono text-black font-medium">
              Shapley Value Attribution
            </div>
          </div>

          {/* Feature 5 */}
          <div className="clean-card rounded-[32px] p-8 border border-[#E5E5E5] flex flex-col justify-between hover:border-black/30">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#EDEDED] border border-neutral-300 flex items-center justify-center text-black mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-light text-black mb-3">5. Intelligent Alerts</h3>
              <p className="text-[#555555] text-sm leading-relaxed font-light">
                Rule engine with deduplication suppression windows that triggers alarms across thermal runaway, power collapse, and vibration zones.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#F0F0F0] text-xs font-mono text-black font-medium">
              Cooldown Deduplication Engine
            </div>
          </div>

          {/* Feature 6 */}
          <div className="clean-card rounded-[32px] p-8 border border-[#E5E5E5] flex flex-col justify-between hover:border-black/30">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#EDEDED] border border-neutral-300 flex items-center justify-center text-black mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-light text-black mb-3">6. Incident Response</h3>
              <p className="text-[#555555] text-sm leading-relaxed font-light">
                Auto-escalates high-consequence alarms to P1 incident tickets, assigns reliability engineers, and tracks corrective work orders.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#F0F0F0] text-xs font-mono text-black font-medium">
              End-to-End Ticketing & Audit Trail
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-6 max-w-[1440px] mx-auto bg-[#FAFAFA] border-y border-[#EAEAEA] rounded-[40px] my-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest uppercase text-neutral-500">
            OPERATIONAL WORKFLOW
          </span>
          <h2 className="section-title font-light text-black mt-2">
            From Sensor to Solution
          </h2>
          <p className="text-[#666666] text-base mt-3 font-light">
            A seamless closed-loop reliability process powering critical plants.
          </p>
        </div>

        {/* Horizontal Flow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {[
            { step: "01", title: "Sensor Data", desc: "Streaming 1Hz telemetry across thermal, vibration, and torque" },
            { step: "02", title: "AI Analysis", desc: "Dual supervised XGBoost & unsupervised Isolation Forest" },
            { step: "03", title: "Risk Insights", desc: "Calibrated failure probabilities and SHAP feature vectors" },
            { step: "04", title: "Smart Alerts", desc: "Rule engine triggers prioritized multi-channel notifications" },
            { step: "05", title: "Maintenance", desc: "Prescriptive task checklists and recorded work orders" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[24px] border border-[#E5E5E5] text-left flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-mono font-bold text-neutral-400 block mb-2">{item.step}</span>
                <h4 className="text-base font-medium text-black mb-2">{item.title}</h4>
                <p className="text-xs text-[#666666] leading-relaxed font-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 px-6 max-w-[1440px] mx-auto text-center">
        <div className="green-accent-gradient rounded-[36px] p-12 md:p-20 border border-[#76FB91] shadow-soft-card max-w-5xl mx-auto relative overflow-hidden">
          <h2 className="hero-title font-light text-black mb-6">
            Make Infrastructure <br />
            <span className="font-normal">Smarter.</span>
          </h2>
          <p className="text-black/80 text-base md:text-lg max-w-xl mx-auto mb-10 font-light">
            Empower your operations with predictive AI intelligence. Zero guesswork, zero unpredicted disruptions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="btn-primary px-9 py-4 text-sm font-semibold flex items-center gap-2 shadow-lg"
            >
              <span>Start Monitoring</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-[#EAEAEA] py-12 px-8 max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-[#666666]">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="w-5 h-5 rounded-full bg-[#76FB91] flex items-center justify-center text-black">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-black">InfraSentinel AI</span>
          <span>&copy; 2026. Critical Infrastructure Reliability Defense.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-black transition">Command Dashboard</Link>
          <Link href="/models" className="hover:text-black transition">ML Benchmarks</Link>
          <Link href="/login" className="hover:text-black transition">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
