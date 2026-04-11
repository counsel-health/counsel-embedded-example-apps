import IntegratedChatPage from "@/components/IntegratedChatPage";
import { getSession } from "@/lib/session";
import { serverEnv } from "@/envConfig";
import { getValidCounselJwt } from "@/lib/server";

/**
 * Integrated chat page — thin shell that reads session credentials
 * and passes them to the client. JWT auth calls Counsel from the browser;
 * API key auth uses `/api/counsel/*` proxies with the session cookie.
 */
export default async function IntegratedChat() {
  const session = await getSession();
  const counselJwt = await getValidCounselJwt(session);

  return (
    <IntegratedChatPage
      counselApiConfig={{
        counselDirectApiBase: `${serverEnv.COUNSEL_API_URL}/v1/user/${session.counselUserId}`,
        counselJwt: counselJwt ?? "",
        counselUserId: session.counselUserId,
      }}
    />
  );
}
