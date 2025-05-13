import { NextFunction, Request, Response } from "express";
import { env } from "@/envConfig";
import { createUser } from "@/db/actions/createUser";
import { createJWTSession } from "@/lib/user-session";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { parseBody } from "@/lib/http";

const SignUpBodySchema = z.object({
  accessCode: z.string().length(6),
});

/**
 * @description Sign up a new user with an access code
 * @route POST /user/signUp
 */
export default async function index(req: Request, res: Response, _next: NextFunction) {
  const body = await parseBody(req, SignUpBodySchema);

  if (body.accessCode.toLowerCase() !== env.ACCESS_CODE.toLowerCase()) {
    res.status(400).json({ error: "Invalid access code" });
    return;
  }

  // Create a new user
  const user = await createUser(uuidv4());

  // Create a new session
  const jwtToken = createJWTSession(user.id);

  res.status(200).json({ token: jwtToken });
}
