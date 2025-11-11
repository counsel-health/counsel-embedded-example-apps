import { NextFunction, Request, Response } from "express";
import { getAccessCodeConfig } from "@/envConfig";
import { createUser } from "@/db/actions/createUser";
import { createJWTSession } from "@/lib/user-session";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { parseBody } from "@/lib/http";
const SignUpBodySchema = z.object({
  userId: z.string().optional(),
  accessCode: z.string().length(6),
});

type AccessCodeCheck =
  | {
      success: true;
      client: string;
      accessCode: string;
      userType: "main" | "onboarding";
    }
  | {
      success: false;
      error: string;
    };

export function checkAccessCode(accessCode: string): AccessCodeCheck {
  const config = getAccessCodeConfig(accessCode);
  if (!config) {
    return { success: false, error: "Invalid access code" };
  }
  
  return {
    success: true,
    client: config.client,
    accessCode,
    userType: config.userType,
  };
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

  const { client, accessCode, userType } = accessCodeCheck;

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
  });
}
