"use server";

import { getIntegratedSignedAppUrl } from "@/lib/server";
import { getSession } from "@/lib/session";

/**
 * Get a signed URL that opens a specific thread in the integrated view.
 */
export async function getSignedUrlForThread(
  threadId: string
): Promise<string> {
  const session = await getSession();
  return getIntegratedSignedAppUrl(session, {
    action: "open_thread",
    thread_id: threadId,
  });
}

/**
 * Get a signed URL that creates a new thread in the integrated view.
 */
export async function getSignedUrlForNewThread(): Promise<string> {
  const session = await getSession();
  return getIntegratedSignedAppUrl(session, { action: "create_thread" });
}
