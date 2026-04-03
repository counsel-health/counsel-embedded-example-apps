import { NextFunction, Request, Response } from "express";
import { getAccessCodeConfig } from "@/envConfig";
import { createUser } from "@/db/actions/createUser";
import { createJWTSession } from "@/lib/user-session";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { parseBody } from "@/lib/http";
import { checkAccessCode } from "./accessCode";

const SignUpBodySchema = z.object({
  userId: z.string().optional(),
  accessCode: z.string().length(6),
});

export { checkAccessCode } from "./accessCode";
export type { AccessCodeCheck } from "./accessCode";

/**
 * @description Sign up a new user with an access code
 * @route POST /user/signUp
 */
export default async function index(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const body = await parseBody(req, SignUpBodySchema);

  const accessCodeCheck = checkAccessCode(body.accessCode);
  if (!accessCodeCheck.success) {
    res.status(400).json({ error: accessCodeCheck.error });
    return;
  }

  const { client, accessCode, userType } = accessCodeCheck;
  const config = getAccessCodeConfig(accessCode)!;

  // Create a new user with the determined userType
  const user = await createUser({
    userId: body.userId ?? uuidv4(),
    accessCode,
    userType,
  });

  // Create a new session with client and accessCode
  const jwtToken = createJWTSession({
    userId: user.id,
    client,
    accessCode,
  });

  res.status(200).json({
    token: jwtToken,
    userType,
    client,
    counselUserId: user.counsel_user_id,
    // Tells the Next.js app which auth flow to use for Counsel API calls
    authType: config.apiKey ? "apiKey" : "jwt",
  });
}
