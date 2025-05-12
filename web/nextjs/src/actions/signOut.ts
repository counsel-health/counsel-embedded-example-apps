"use server";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { getChatSignedAppUrlCacheKey } from "@/lib/server";

export async function signOut() {
  const session = await getSession();
  // Destroy the session
  session.destroy();
  // Invalidate the chat signed app url cache
  revalidateTag(getChatSignedAppUrlCacheKey(session.userId));
  redirect("/login");
}
