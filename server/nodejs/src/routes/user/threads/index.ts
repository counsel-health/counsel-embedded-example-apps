import { NextFunction, Request, Response } from "express";
import { getOrCreateUser } from "../signedAppUrl";
import { getCounselUserThreads } from "@/lib/counsel";
import { isAuthenticatedRequest } from "@/lib/user-session";

/**
 * @description Get the user's chat threads from the Counsel API
 * @route GET /user/threads
 */
export default async function index(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { userId, accessCode } = req.user;

  const user = await getOrCreateUser(userId, accessCode);

  const threads = await getCounselUserThreads({
    userId: user.counsel_user_id,
    accessCode,
  });

  res.status(200).json(threads);
}
