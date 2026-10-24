"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, User, Building, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    orgName: "",
    role: "operator",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        org_name: formData.orgName,
        role: formData.role,
      });
      setUser(res.user, res.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[400px] bg-[#76FB91]/20 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[36px] border border-[#CCCCCC]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#76FB91] flex items-center justify-center text-black mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl font-light text-black tracking-tight">Register Organization</h2>
          <p className="text-xs text-black/50 mt-1">Set up facility monitoring tenant credentials</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-black/70 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-black/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Marcus Reed"
                className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-full pl-11 pr-4 py-2.5 text-xs text-black placeholder-black/40 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-black/70 mb-1">Facility / Plant Name</label>
            <div className="relative">
              <Building className="w-4 h-4 text-black/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.orgName}
                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                placeholder="Apex Energy Generating Station"
                className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-full pl-11 pr-4 py-2.5 text-xs text-black placeholder-black/40 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-black/70 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-black/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="mreed@apexenergy.io"
                className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-full pl-11 pr-4 py-2.5 text-xs text-black placeholder-black/40 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-black/70 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-black/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full bg-[#F7F7F8] border border-[#CCCCCC] rounded-full pl-11 pr-4 py-2.5 text-xs text-black placeholder-black/40 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-black hover:bg-black/85 text-white font-medium text-xs shadow-sm transition flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? "Creating Account..." : "Provision Facility Terminal"}</span>
            <ArrowRight className="w-4 h-4 text-[#76FB91]" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-black/50">
          Already have an operator account?{" "}
          <Link href="/login" className="text-black font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
