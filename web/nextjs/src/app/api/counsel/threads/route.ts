import { getSession } from "@/lib/session";
import { serverEnv } from "@/envConfig";
import { getValidCounselJwt } from "@/lib/server";
import { fetchWithRetry } from "@/lib/http";

/**
 * Proxies GET /v1/user/:id/threads for the integrated chat client.
 * Uses the Counsel JWT when authType is jwt; otherwise forwards to the demo
 * server with the session token (API key flow).
 */
export async function GET() {
  const session = await getSession();
  if (!session.token || !session.counselUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const counselJwt = await getValidCounselJwt(session);

  if (session.authType === "jwt" && counselJwt) {
    const resp = await fetchWithRetry(
      `${session.counselApiUrl}/v1/user/${session.counselUserId}/threads`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${counselJwt}`,
          "Idempotency-Key": crypto.randomUUID(),
        },
      },
    );
    const body = await resp.text();
    return new Response(body, {
      status: resp.status,
      headers: { "Content-Type": "application/json" },
    });
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
