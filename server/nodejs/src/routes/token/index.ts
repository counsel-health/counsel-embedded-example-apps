import { Elysia } from "elysia";
import { z } from "zod";
import { signCounselJwt } from "@/lib/keys";
import { UserFacingError } from "@/lib/http";
import { withAuth } from "@/lib/user-session";
import { getAccessCodeConfig } from "@/envConfig";

const TokenResponseSchema = z.object({ token: z.string() });

// Returns a short-lived Counsel JWT for the authenticated user.
// The Next.js app uses this to call Counsel APIs directly.
export const TokenPlugin = new Elysia({ prefix: "/token" })
  .use(withAuth)
  .post(
    "/",
    async ({ user }): Promise<{ token: string }> => {
      const config = getAccessCodeConfig(user.accessCode);
      if (!config) {
        throw new UserFacingError("Invalid access code", 400);
      }
      if (!config.issuer) {
        throw new UserFacingError(
          "This access code uses API key auth. Use the server's /user/signedAppUrl endpoint instead of /token.",
          400
        );
      }
      const token = await signCounselJwt(user.userId, config.issuer);
      return { token };
    },
    { response: TokenResponseSchema }
  );
