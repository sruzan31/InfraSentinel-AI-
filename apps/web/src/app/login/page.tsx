"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  const [email, setEmail] = useState("operator@infrasentinel.io");
  const [password, setPassword] = useState("Operator123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      setUser(res.user, res.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoProfile = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[400px] bg-[#76FB91]/20 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[36px] border border-[#CCCCCC]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#76FB91] flex items-center justify-center text-black mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl font-light text-black tracking-tight">Operator Authentication</h2>
          <p className="text-xs text-black/50 mt-1">Access InfraSentinel Critical Monitoring Command</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-black/70 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-black/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@infrasentinel.io"
                className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-full pl-11 pr-4 py-3 text-xs text-black placeholder-black/40 focus:outline-none focus:border-black transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-black/70 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-black/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-full pl-11 pr-4 py-3 text-xs text-black placeholder-black/40 focus:outline-none focus:border-black transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-black hover:bg-black/85 text-white font-medium text-xs shadow-sm transition flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Terminal"}</span>
            <ArrowRight className="w-4 h-4 text-[#76FB91]" />
          </button>
        </form>

        {/* Demo Fast-Login Profiles */}
        <div className="mt-8 pt-6 border-t border-[#EBEBEB]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-black/50 block text-center mb-3">
            Quick One-Click Demo Profiles
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoProfile("operator@infrasentinel.io", "Operator123!")}
              className="px-2 py-2.5 rounded-2xl bg-[#F7F7F8] hover:bg-[#EDEDED] border border-[#CCCCCC]/40 text-[11px] text-black font-medium transition flex flex-col items-center text-center"
            >
              <UserCheck className="w-3.5 h-3.5 text-black mb-1" />
              <span>Operator</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoProfile("engineer@infrasentinel.io", "Engineer123!")}
              className="px-2 py-2.5 rounded-2xl bg-[#F7F7F8] hover:bg-[#EDEDED] border border-[#CCCCCC]/40 text-[11px] text-black font-medium transition flex flex-col items-center text-center"
            >
              <UserCheck className="w-3.5 h-3.5 text-black mb-1" />
              <span>Engineer</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoProfile("admin@infrasentinel.io", "Admin123!")}
              className="px-2 py-2.5 rounded-2xl bg-[#F7F7F8] hover:bg-[#EDEDED] border border-[#CCCCCC]/40 text-[11px] text-black font-medium transition flex flex-col items-center text-center"
            >
              <UserCheck className="w-3.5 h-3.5 text-black mb-1" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-black/50">
          Need a new facility tenant account?{" "}
          <Link href="/register" className="text-black font-semibold hover:underline">
            Register Organization
          </Link>
        </div>
      </div>
    </div>
  );
}
