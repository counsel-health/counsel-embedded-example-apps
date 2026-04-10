import IntegratedChatPage from "@/components/IntegratedChatPage";
import { getSession } from "@/lib/session";
import { serverEnv } from "@/envConfig";

/**
 * Integrated chat page — thin shell that reads session credentials
 * and passes them to the client. All API calls (threads, signed URLs)
 * happen directly from the browser to the Counsel API using JWT auth.
 */
export default async function IntegratedChat() {
  const session = await getSession();

  return (
    <IntegratedChatPage
      counselApiConfig={{
        counselApiUrl: serverEnv.COUNSEL_API_URL,
        counselJwt: session.counselJwt ?? "",
        counselUserId: session.counselUserId,
      }}
    />
  );
}
