import { getOrCreateUser } from "../signedAppUrl";
import { getCounselUserThreads } from "@/lib/counsel";
import type { User } from "@/lib/user-session";

/**
 * @description Get the user's chat threads from the Counsel API
 * @route GET /user/threads
 */
export async function threadsHandler({ user }: { user: User }) {
  const u = await getOrCreateUser(user.userId, user.accessCode);
  const threads = await getCounselUserThreads({
    userId: u.counsel_user_id,
    accessCode: user.accessCode,
  });
  return threads;
}
