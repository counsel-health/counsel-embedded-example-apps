import type React from "react";
import Header from "@/components/Header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header />
      {/* Main Content */}
      <main className="flex-1 h-full min-h-0">{children}</main>
    </div>
  );
}
