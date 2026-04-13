import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { interBody, interMono, interTitle } from "./fonts";

export const metadata: Metadata = {
  title: "Embedded Corp Wellness",
  description: "Embedded Corp Wellness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${interBody.variable} ${interMono.variable} ${interTitle.variable}`}>
      <body>{children}</body>
    </html>
  );
}
