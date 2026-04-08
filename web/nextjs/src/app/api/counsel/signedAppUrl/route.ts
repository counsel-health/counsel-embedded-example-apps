import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getIntegratedSignedAppUrl } from "@/lib/server";

/**
 * POST /api/counsel/signedAppUrl
 *
 * Returns a one-time-use signed app URL for the integrated Counsel view.
 * Called directly from the browser for speed (no server action overhead).
 *
 * Request body (optional):
 *   { action: { action: "create_thread" } }
 *   { action: { action: "open_thread", thread_id: "uuid" } }
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let action:
    | { action: "open_thread"; thread_id: string }
    | { action: "create_thread" }
    | undefined;

  try {
    const body = await request.json();
    if (body.action) {
      action = body.action;
    }
  } catch {
    // No body or invalid JSON — proceed without action
  }

  try {
    const url = await getIntegratedSignedAppUrl(session, action);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Failed to get signed app URL:", error);
    return NextResponse.json(
      { error: "Failed to get signed app URL" },
      { status: 500 }
    );
  }
}
