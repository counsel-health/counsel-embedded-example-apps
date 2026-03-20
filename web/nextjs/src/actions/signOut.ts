"use server";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { getChatSignedAppUrlCacheKey, signOutCounselUser } from "@/lib/server";

export async function signOut() {
  const session = await getSession();
  // Capture values before destroying the session (destroy() clears all session properties)
  const { token, counselUserId } = session;
  if (token) {
    // Don't block the sign out process if there's a server error
    signOutCounselUser(token).catch((error) => {
      console.error("Failed to sign out user from demo server", error);
    });
  }
  // Destroy the session
  session.destroy();
  if (counselUserId) {
    // Invalidate the chat signed app url cache
    revalidateTag(getChatSignedAppUrlCacheKey(counselUserId));
  }
  redirect("/login");
}
