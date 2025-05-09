import { z } from "zod";
import { parseBody } from "@/lib/http";
import { getUser } from "@/db/actions/getUser";
import { getCounselSignedAppUrl } from "@/lib/counsel";
import { NextFunction, Request, Response } from "express";

const SignedAppUrlBodySchema = z.object({
  userId: z.string(),
});

export default async function index(req: Request, res: Response, _next: NextFunction) {
  const body = await parseBody(req, SignedAppUrlBodySchema);

  // 1. Check the user exists
  const user = await getUser(body.userId);

  // 2. Call the Counsel API to get the signed app url
  const { url } = await getCounselSignedAppUrl(user.counsel_user_id);

  res.status(200).json({ url });
}
