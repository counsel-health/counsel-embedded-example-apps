"use server";

import { getChatSignedAppUrlCacheKey, signOutCounselUser } from "@/lib/server";
import { getSession } from "@/lib/session";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { authLogger } from "@/lib/logger";

export async function signOut() {
  const session = await getSession();
  // Capture values before destroying the session (destroy() clears all session properties)
  const { token, counselUserId } = session;
  if (token) {
    // Don't block the sign out process if there's a server error
    signOutCounselUser(token).catch((error) => {
      authLogger.error({ error }, "Failed to sign out user from demo server");
    });
  }
  // Destroy the session
  session.destroy();
  if (counselUserId) {
    // Invalidate the chat signed app url cache
    revalidateTag(getChatSignedAppUrlCacheKey(counselUserId), "max");
  }
  redirect("/login");
}
