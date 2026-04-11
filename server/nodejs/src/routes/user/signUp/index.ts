import { createUser } from "@/db/actions/createUser";
import { getAccessCodeConfig } from "@/envConfig";
import { UserFacingError } from "@/lib/http";
import { createJWTSession } from "@/lib/user-session";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { checkAccessCode } from "./accessCode";

export const SignUpBodySchema = z.object({
  userId: z.string().optional(),
  accessCode: z.string().length(6),
});

export const SignUpResponseSchema = z.object({
  token: z.string(),
  userType: z.enum(["main", "onboarding"]),
  client: z.string(),
  counselUserId: z.string(),
  authType: z.enum(["apiKey", "jwt"]),
  navMode: z.enum(["standalone", "integrated"]),
  counselApiUrl: z.url(),
});

export { checkAccessCode } from "./accessCode";
export type { AccessCodeCheck } from "./accessCode";

/**
 * @description Sign up a new user with an access code
 * @route POST /user/signUp
 */
export async function signUpHandler({
  body,
}: {
  body: z.infer<typeof SignUpBodySchema>;
}): Promise<z.infer<typeof SignUpResponseSchema>> {
  const accessCodeCheck = checkAccessCode(body.accessCode);
  if (!accessCodeCheck.success) {
    throw new UserFacingError(accessCodeCheck.error, 400);
  }

  const { client, accessCode, userType } = accessCodeCheck;
  const config = getAccessCodeConfig(accessCode)!;

  const user = await createUser({
    userId: body.userId ?? uuidv4(),
    accessCode,
    userType,
  });

  const jwtToken = createJWTSession({ userId: user.id, client, accessCode });

  return {
    token: jwtToken,
    userType,
    client,
    counselUserId: user.counsel_user_id,
    authType: config.apiKey ? "apiKey" : "jwt",
    navMode: config.navMode ?? "standalone",
    counselApiUrl: config.apiUrl,
  };
}
