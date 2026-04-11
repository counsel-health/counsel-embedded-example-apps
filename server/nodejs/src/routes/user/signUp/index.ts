import { createUser } from "@/db/actions/createUser";
import { getAccessCodeConfig } from "@/envConfig";
import { createJWTSession } from "@/lib/user-session";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { checkAccessCode } from "./accessCode";

export const SignUpBodySchema = z.object({
  userId: z.string().optional(),
  accessCode: z.string().length(6),
});

export { checkAccessCode } from "./accessCode";
export type { AccessCodeCheck } from "./accessCode";

/**
 * @description Sign up a new user with an access code
 * @route POST /user/signUp
 */
export async function signUpHandler({
  body,
  error,
}: {
  body: z.infer<typeof SignUpBodySchema>;
  error: (status: number, data: unknown) => unknown;
}) {
  const accessCodeCheck = checkAccessCode(body.accessCode);
  if (!accessCodeCheck.success) {
    return error(400, { error: accessCodeCheck.error });
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
    // Tells the Next.js app which auth flow to use for Counsel API calls
    authType: config.apiKey ? "apiKey" : "jwt",
    navMode: config.navMode,
  };
}
