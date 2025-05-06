import { getUser } from "@/lib/mocks";
import { getCounselSignedAppUrl } from "@/lib/server";
import ChatPage from "@/components/ChatPage";

/**
 * Chat page is the most important for showcasing the embedded app as this is where its hosted.
 */
export default async function Chat() {
  const user = getUser();
  const signedAppUrl = await getCounselSignedAppUrl(user.id);

  return <ChatPage signedAppUrl={signedAppUrl} />;
}
