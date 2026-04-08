import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCounselThreads } from "@/lib/server";

/**
 * GET /api/counsel/threads
 *
 * Returns the user's Counsel chat threads.
 * Called directly from the browser for speed (no server action overhead).
 */
export async function GET() {
  const session = await getSession();
  if (!session.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getCounselThreads(session);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to get threads:", error);
    return NextResponse.json(
      { error: "Failed to get threads" },
      { status: 500 }
    );
  }
}
