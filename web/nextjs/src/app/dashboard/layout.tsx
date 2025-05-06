"use client";

import type React from "react";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
