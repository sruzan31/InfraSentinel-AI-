"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-black">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 mt-20 p-8 overflow-y-auto max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
