"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Layers,
  Radio,
  Cpu,
  Flame,
  AlertTriangle,
  Zap,
  Wrench,
  Sparkles,
  BarChart3,
  FileText,
  Sliders,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: Activity },
  { name: "Equipment", href: "/equipment", icon: Layers },
  { name: "Live Monitoring", href: "/monitoring", icon: Radio },
  { name: "AI Predictions", href: "/predictions", icon: Cpu },
  { name: "Anomalies", href: "/anomalies", icon: Flame },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Incidents", href: "/incidents", icon: Zap },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "ML Models", href: "/models", icon: Sparkles },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Sliders },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAppStore();

  return (
    <aside className="w-64 bg-white border-r border-[#EBEBEB] flex flex-col justify-between h-screen fixed left-0 top-0 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-[#F0F0F0] gap-3">
          <div className="w-9 h-9 rounded-full bg-[#DFFFE6] border border-[#76FB91] flex items-center justify-center text-black shadow-sm">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-black flex items-center gap-1.5">
              <span>InfraSentinel</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#76FB91]" />
            </span>
            <span className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase block">
              AI MONITORING
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs transition-all duration-200 font-medium ${
                  isActive
                    ? "bg-[#76FB91] text-black shadow-pill-glow font-semibold"
                    : "text-[#555555] hover:text-black hover:bg-[#F5F5F5]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-[#777777]"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-[#F0F0F0] bg-[#FAFAFA]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold">
              {user?.full_name?.charAt(0) || "O"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-black truncate">{user?.full_name || "Alex Mercer"}</p>
              <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">{user?.role || "Operator"}</p>
            </div>
          </div>
          <Link
            href="/login"
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
