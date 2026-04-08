import ChatPage from "@/components/ChatPage";
import IntegratedChatPage from "@/components/IntegratedChatPage";
import {
  getCounselSignedAppUrl,
  getIntegratedSignedAppUrl,
  getCounselThreads,
} from "@/lib/server";
import { getSession } from "@/lib/session";

/**
 * Chat page renders the Counsel app inside an iframe.
 *
 * Two integration patterns:
 * - "standalone" (default): full Counsel iframe with built-in sidebar
 * - "integrated": host-managed thread sidebar + Counsel integrated view
 */
export default async function Chat() {
  const session = await getSession();

  if (session.navMode === "integrated") {
    const [signedAppUrl, { threads }] = await Promise.all([
      getIntegratedSignedAppUrl(session),
      getCounselThreads(session),
    ]);

    return (
      <IntegratedChatPage signedAppUrl={signedAppUrl} threads={threads} />
    );
  }

  const signedAppUrl = await getCounselSignedAppUrl(session);
  return <ChatPage signedAppUrl={signedAppUrl} />;
}
