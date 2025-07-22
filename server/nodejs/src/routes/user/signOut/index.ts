import { signOutCounselUser } from "@/lib/counsel";
import { isAuthenticatedRequest } from "@/lib/user-session";
import { NextFunction, Request, Response } from "express";

/**
 * @description Sign out a user from Counsel
 * @route POST /user/signOut
 */
export default async function index(req: Request, res: Response, _next: NextFunction) {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { userId, userType } = req.user;

  await signOutCounselUser({ userId, userType });

  // NOTE: we don't end the session here because the JWT is stateless
  // and we don't have a long-running database to delete the session from
  // In your own application, you should end the session here as well

  res.status(200).json({ status: "ok" });
}
