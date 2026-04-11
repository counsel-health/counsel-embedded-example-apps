import { signOutCounselUser } from "@/lib/counsel";
import type { User } from "@/lib/user-session";

/**
 * @description Sign out a user from Counsel
 * @route POST /user/signOut
 */
export async function signOutHandler({ user }: { user: User }) {
  await signOutCounselUser({
    userId: user.userId,
    accessCode: user.accessCode,
  });

  // NOTE: we don't end the session here because the JWT is stateless
  // and we don't have a long-running database to delete the session from.
  // In your own application, you should end the session here as well.

  return { status: "ok" };
}
