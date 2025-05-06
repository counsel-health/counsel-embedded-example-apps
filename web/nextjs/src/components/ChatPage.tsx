"use client";

import { CounselApp } from "./counsel/CounselApp";

export default function ChatPage({ signedAppUrl }: { signedAppUrl: string }) {
  return (
    <CounselApp
      signedAppUrl={signedAppUrl}
      // Importantly the parent div(s) must have an explicit height set for height: 100% to work
      // In this case the parent is h-screen so the iframe will take the full height
      className="h-full w-full"
    />
  );
}
