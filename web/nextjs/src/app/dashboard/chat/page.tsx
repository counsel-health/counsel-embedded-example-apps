import ChatPage from "@/components/ChatPage";
import HandOffChatPage from "@/components/HandOffChatPage";
import { getCounselSignedAppUrl } from "@/lib/server";
import { getSession } from "@/lib/session";

/**
 * Chat page renders the Counsel app inside an iframe.
 * For "handoff" userType, renders a host chat UI with an inline trigger card.
 */
export default async function Chat() {
  const session = await getSession();
  const signedAppUrl = await getCounselSignedAppUrl(session);

  if (session.userType === "handoff") {
    return (
      <HandOffChatPage
        signedAppUrl={signedAppUrl}
        handoffTrigger={session.handoffTrigger}
      />
    );
  }

  return <ChatPage signedAppUrl={signedAppUrl} />;
}
