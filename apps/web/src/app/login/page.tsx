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
    <div className="min-h-screen bg-[#060B16] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 shadow-glow">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Operator Authentication</h2>
          <p className="text-xs text-slate-400 mt-1">Access InfraSentinel Critical Monitoring Command</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@infrasentinel.io"
                className="w-full bg-[#0B1220] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0B1220] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In to Terminal"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast-Login Profiles */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block text-center mb-3">
            Quick One-Click Demo Profiles
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoProfile("operator@infrasentinel.io", "Operator123!")}
              className="px-2 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-white/5 text-[11px] text-slate-300 hover:text-white transition flex flex-col items-center text-center"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400 mb-1" />
              <span>Operator</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoProfile("engineer@infrasentinel.io", "Engineer123!")}
              className="px-2 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-white/5 text-[11px] text-slate-300 hover:text-white transition flex flex-col items-center text-center"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 mb-1" />
              <span>Engineer</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoProfile("admin@infrasentinel.io", "Admin123!")}
              className="px-2 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-white/5 text-[11px] text-slate-300 hover:text-white transition flex flex-col items-center text-center"
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-400 mb-1" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Need a new facility tenant account?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Register Organization
          </Link>
        </div>
      </div>
    </div>
  );
}
