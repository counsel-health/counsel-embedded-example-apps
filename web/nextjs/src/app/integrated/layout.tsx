import type React from "react";

export default function IntegratedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <main className="flex-1 h-full min-h-0">{children}</main>
    </div>
  );
}
