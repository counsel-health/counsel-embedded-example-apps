"use server";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function signOut() {
  const session = await getSession();
  // Destroy the session
  session.destroy();

  redirect("/login");
}
