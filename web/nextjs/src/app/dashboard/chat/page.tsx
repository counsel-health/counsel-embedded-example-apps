import ChatPage from "@/components/ChatPage";
import { getCounselSignedAppUrl } from "@/lib/server";
import { getSession } from "@/lib/session";

/**
 * Chat page renders the Counsel app inside an iframe (standalone pattern).
 * The full Counsel experience with built-in sidebar.
 */
export default async function Chat() {
  const session = await getSession();
  const signedAppUrl = await getCounselSignedAppUrl(session);
  return <ChatPage signedAppUrl={signedAppUrl} />;
}
