import IntegratedChatPage from "@/components/IntegratedChatPage";
import { getCounselThreads } from "@/lib/server";
import { getSession } from "@/lib/session";

/**
 * Integrated chat page — top-level route for the host-managed
 * thread sidebar + Counsel integrated view pattern.
 */
export default async function IntegratedChat() {
  const session = await getSession();
  const { threads } = await getCounselThreads(session);

  return <IntegratedChatPage threads={threads} />;
}
