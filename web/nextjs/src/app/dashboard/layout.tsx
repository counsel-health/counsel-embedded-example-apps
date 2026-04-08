import type React from "react";
import Header from "@/components/Header";
import { getUserAgent } from "@/lib/userAgent";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userAgent, session] = await Promise.all([
    getUserAgent(),
    getSession(),
  ]);
  const isIntegrated = session.navMode === "integrated";

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {!isIntegrated && <Header userAgent={userAgent} />}
      {/* Main Content */}
      <main className="flex-1 h-full min-h-0">{children}</main>
    </div>
  );
}
