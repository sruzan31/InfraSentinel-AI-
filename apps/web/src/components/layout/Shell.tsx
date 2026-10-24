"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060B16] text-[#F8FAFC]">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 mt-16 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
