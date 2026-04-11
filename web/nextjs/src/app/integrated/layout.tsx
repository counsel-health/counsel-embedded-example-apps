import type React from "react";
import QueryProvider from "@/providers/QueryProvider";

export default function IntegratedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        <main className="flex-1 h-full min-h-0">{children}</main>
      </div>
    </QueryProvider>
  );
}
