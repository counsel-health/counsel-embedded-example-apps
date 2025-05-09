"use client";

import { useEffect } from "react";
import { signOut } from "@/actions/signOut";

export default function LogoutPage() {
  useEffect(() => {
    signOut();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <h1 className="text-2xl font-bold">Logging out...</h1>
    </div>
  );
}
