import { NextFunction, Request, Response } from "express";
import { env } from "@/envConfig";
import { createUser } from "@/db/actions/createUser";
import { createJWTSession } from "@/lib/user-session";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { parseBody } from "@/lib/http";
import { UserType } from "@/lib/counsel";
import { stringCompare } from "@/lib/authentication";

const SignUpBodySchema = z.object({
  userId: z.string().optional(),
  accessCode: z.string().length(6),
});

type AccessCodeCheck =
  | {
      success: true;
      type: UserType;
    }
  | {
      success: false;
      error: string;
    };

function checkAccessCode(accessCode: string): AccessCodeCheck {
  if (stringCompare(accessCode, env.ACCESS_CODE)) {
    return { success: true, type: "main" };
  }
  if (stringCompare(accessCode, env.ACCESS_CODE_COUNSEL_ONBOARDING)) {
    return { success: true, type: "onboarding" };
  }
  return { success: false, error: "Invalid access code" };
}

/**
 * @description Sign up a new user with an access code
 * @route POST /user/signUp
 */
export default async function index(req: Request, res: Response, _next: NextFunction) {
  const body = await parseBody(req, SignUpBodySchema);

  const accessCodeCheck = checkAccessCode(body.accessCode);
  if (!accessCodeCheck.success) {
    res.status(400).json({ error: accessCodeCheck.error });
    return;
  }

  // Create a new user
  const user = await createUser({
    userId: body.userId ?? uuidv4(),
    userType: accessCodeCheck.type,
  });

  // Create a new session
  const jwtToken = createJWTSession({ userId: user.id, userType: accessCodeCheck.type });

  res.status(200).json({ token: jwtToken, userType: accessCodeCheck.type });
}
