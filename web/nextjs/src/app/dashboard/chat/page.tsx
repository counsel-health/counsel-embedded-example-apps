import ChatPage from "@/components/ChatPage";
import HandOffChatPage from "@/components/HandOffChatPage";
import {
  getCounselSignedAppUrl,
  getCounselThreads,
} from "@/lib/server";
import { getSession } from "@/lib/session";

/**
 * Chat page renders the Counsel app inside an iframe.
 * For "handoff" userType, renders a host chat UI with a thread sidebar
 * and an inline trigger card for handoff to the Counsel integrated view.
 */
export default async function Chat() {
  const session = await getSession();

  if (session.userType === "handoff") {
    const [signedAppUrl, { threads }] = await Promise.all([
      getCounselSignedAppUrl(session, {
        view: { navigation: "integrated" },
      }),
      getCounselThreads(session),
    ]);

    return (
      <HandOffChatPage
        signedAppUrl={signedAppUrl}
        handoffTrigger={session.handoffTrigger}
        threads={threads}
      />
    );
  }

  const signedAppUrl = await getCounselSignedAppUrl(session);
  return <ChatPage signedAppUrl={signedAppUrl} />;
}
