import { z } from "zod";
import { parseBody } from "@/lib/http";
import { getUser } from "@/db/actions/getUser";
import { getCounselSignedAppUrl } from "@/lib/counsel";
import { NextFunction, Request, Response } from "express";
import { safePromise } from "@/lib/promise";
import { DBRowNotFoundError } from "@/db/lib/dbErrors";
import { createUser } from "@/db/actions/createUser";

const SignedAppUrlBodySchema = z.object({
  userId: z.string(),
});

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

export default async function index(req: Request, res: Response, _next: NextFunction) {
  const body = await parseBody(req, SignedAppUrlBodySchema);

  // 1. Check the user exists - if not, create them (this is an edge case bc we don't persist the user across server restarts)
  // Don't use this as an example in your logic, instead just get the user from the database
  const user = await getOrCreateUser(body.userId);

  // 2. Call the Counsel API to get the signed app url
  const { url } = await getCounselSignedAppUrl(user.counsel_user_id);

  res.status(200).json({ url });
}
