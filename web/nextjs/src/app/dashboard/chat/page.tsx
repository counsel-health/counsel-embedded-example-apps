import ChatPage from "@/components/ChatPage";
import { getUser } from "@/lib/mocks";
import { getCounselSignedAppUrl } from "@/lib/server";
import { getSession } from "@/lib/session";

/**
 * Chat page renders the Counsel app inside an iframe.
 */
export default async function Chat() {
  const session = await getSession();
  const user = getUser(session.userId);
  const signedAppUrl = await getCounselSignedAppUrl(user.id);

  return <ChatPage signedAppUrl={signedAppUrl} />;
}
