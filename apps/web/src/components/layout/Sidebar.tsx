"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Cpu,
  AlertTriangle,
  Flame,
  Wrench,
  BarChart3,
  Sliders,
  Radio,
  Layers,
  FileText,
  ShieldCheck,
  LogOut,
  Sparkles,
  Zap
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const navItems = [
  { name: "Command Dashboard", href: "/dashboard", icon: Activity },
  { name: "Equipment Matrix", href: "/equipment", icon: Layers },
  { name: "Live Telemetry", href: "/monitoring", icon: Radio },
  { name: "AI Prediction & SHAP", href: "/predictions", icon: Cpu },
  { name: "Anomaly Timeline", href: "/anomalies", icon: Flame },
  { name: "Alerts Center", href: "/alerts", icon: AlertTriangle },
  { name: "Incident Response", href: "/incidents", icon: Zap },
  { name: "Maintenance Intel", href: "/maintenance", icon: Wrench },
  { name: "ML Models & Dataset", href: "/models", icon: Sparkles },
  { name: "Fleet Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reports & Audit", href: "/reports", icon: FileText },
  { name: "System Settings", href: "/settings", icon: Sliders },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAppStore();

  return (
    <aside className="w-64 bg-[#0B1220]/95 backdrop-blur-md border-r border-white/5 flex flex-col justify-between h-screen fixed left-0 top-0 z-40">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/5 gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-glow">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-wide bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
              INFRASENTINEL
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">AI DEFENSE v1.0</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_-3px_rgba(59,130,246,0.25)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 bg-[#080E1A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || "Operator"}</p>
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">{user?.role || "Operator"}</p>
            </div>
          </div>
          <Link
            href="/login"
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
