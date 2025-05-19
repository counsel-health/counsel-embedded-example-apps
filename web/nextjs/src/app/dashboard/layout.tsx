import type React from "react";
import Header from "@/components/Header";
import { getUserAgent } from "@/lib/userAgent";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userAgent = await getUserAgent();
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header userAgent={userAgent} />
      {/* Main Content */}
      <main className="flex-1 h-full min-h-0">{children}</main>
    </div>
  );
}
