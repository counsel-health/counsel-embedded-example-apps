import { NextFunction, Request, Response } from "express";
import { getUser } from "@/db/actions/getUser";
import { DBRowNotFoundError } from "@/db/lib/dbErrors";
import { getCounselSignedAppUrl } from "@/lib/counsel";
import { safePromise } from "@/lib/promise";
import { createUser } from "@/db/actions/createUser";
import { isAuthenticatedRequest } from "@/lib/user-session";
async function getOrCreateUser(userId: string) {
  const [user, error] = await safePromise(getUser(userId));
  if (error instanceof DBRowNotFoundError) {
    return await createUser(userId);
  }
  if (error) {
    throw error;
  }
  return user;
}

/**
 * @description Get the signed app url for the user
 * @route POST /user/signedAppUrl
 */
export default async function index(req: Request, res: Response, _next: NextFunction) {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { userId } = req.user;

  // 1. Check the user exists - if not, create them (this is an edge case bc we don't persist the user across server restarts)
  // Don't use this as an example in your logic, instead just get the user from the database
  const user = await getOrCreateUser(userId);

  // 2. Call the Counsel API to get the signed app url
  const { url } = await getCounselSignedAppUrl(user.counsel_user_id);

  res.status(200).json({ url });
}
