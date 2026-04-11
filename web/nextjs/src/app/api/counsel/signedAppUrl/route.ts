import { getSession } from "@/lib/session";
import { serverEnv } from "@/envConfig";
import { getValidCounselJwt } from "@/lib/server";
import { fetchWithRetry } from "@/lib/http";

/**
 * Proxies POST /v1/user/:id/signedAppUrl for the integrated chat client.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session.token || !session.counselUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionData = await req.json();
  const counselJwt = await getValidCounselJwt(session);

  if (session.authType === "jwt" && counselJwt) {
    const resp = await fetchWithRetry(
      `${serverEnv.COUNSEL_API_URL}/v1/user/${session.counselUserId}/signedAppUrl`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${counselJwt}`,
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(sessionData),
      },
    );
    const body = await resp.text();
    return new Response(body, {
      status: resp.status,
      headers: { "Content-Type": "application/json" },
    });
  }

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
