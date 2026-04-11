import IntegratedChatPage from "@/components/IntegratedChatPage";
import { getSession } from "@/lib/session";
import { serverEnv } from "@/envConfig";
import { getValidCounselJwt } from "@/lib/server";

/**
 * Integrated chat page — thin shell that reads session credentials
 * and passes them to the client. All API calls (threads, signed URLs)
 * happen directly from the browser to the Counsel API using JWT auth.
 */
export default async function IntegratedChat() {
  const session = await getSession();
  const counselJwt = await getValidCounselJwt(session);

  return (
    <IntegratedChatPage
      counselApiConfig={{
        counselApiUrl: serverEnv.COUNSEL_API_URL,
        counselJwt: counselJwt ?? "",
        counselUserId: session.counselUserId,
      }}
    />
  );
}
