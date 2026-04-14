import { getSession } from "@/lib/session";
import { serverEnv } from "@/envConfig";
import { fetchWithRetry } from "@/lib/http";

/**
 * Proxies GET /v1/user/:id/threads for the integrated chat client via the demo
 * server (session Bearer). Browser-direct JWT calls go to Counsel from the client.
 */
export async function GET() {
  const session = await getSession();
  if (!session.token || !session.counselUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resp = await fetchWithRetry(`${serverEnv.SERVER_HOST}/user/threads`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
  });
  const body = await resp.text();
  return new Response(body, {
    status: resp.status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Proxies POST /v1/user/:id/threads to create a new thread.
 *
 * Only used in API key mode — the browser cannot hold the secret, so it
 * proxies through here → demo server → Counsel API.
 * In JWT mode the browser calls the Counsel API directly and never hits this route.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session.token || !session.counselUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestBody = await req.json();

  const resp = await fetchWithRetry(`${serverEnv.SERVER_HOST}/user/threads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify(requestBody),
  });
  const body = await resp.text();
  return new Response(body, {
    status: resp.status,
    headers: { "Content-Type": "application/json" },
  });
}
