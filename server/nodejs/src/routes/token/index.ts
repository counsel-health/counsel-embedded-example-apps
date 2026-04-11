import { Elysia } from "elysia";
import { signCounselJwt } from "@/lib/keys";
import { withAuth } from "@/lib/user-session";
import { getAccessCodeConfig } from "@/envConfig";

// Returns a short-lived Counsel JWT for the authenticated user.
// The Next.js app uses this to call Counsel APIs directly.
export const TokenPlugin = new Elysia({ prefix: "/token" })
  .use(withAuth)
  .post("/", async ({ user, status }) => {
    const config = getAccessCodeConfig(user.accessCode);
    if (!config) {
      return status(400, { error: "Invalid access code" });
    }
    if (!config.issuer) {
      return status(400, {
        error:
          "This access code uses API key auth. Use the server's /user/signedAppUrl endpoint instead of /token.",
      });
    }
    const token = await signCounselJwt(user.userId, config.issuer);
    return { token };
  });
