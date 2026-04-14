import { serverEnv } from "@/envConfig";
import { fetchWithRetry } from "@/lib/http";
import { getSession } from "@/lib/session";

/**
 * Proxies POST /v1/user/:id/signedAppUrl for the integrated chat client via the
 * demo server. Browser-direct JWT uses Counsel from the client, not this route.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session.token || !session.counselUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionData = await req.json();

  const resp = await fetchWithRetry(`${serverEnv.SERVER_HOST}/user/signedAppUrl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify(sessionData),
  });
  const body = await resp.text();
  return new Response(body, {
    status: resp.status,
    headers: { "Content-Type": "application/json" },
  });
}
