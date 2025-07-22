import ChatPage from "@/components/ChatPage";
import { getCounselSignedAppUrl } from "@/lib/server";
import { getSession } from "@/lib/session";

/**
 * Chat page renders the Counsel app inside an iframe.
 */
export default async function Chat() {
  const session = await getSession();
  const signedAppUrl = await getCounselSignedAppUrl(session.token);

  return <ChatPage signedAppUrl={signedAppUrl} />;
}
