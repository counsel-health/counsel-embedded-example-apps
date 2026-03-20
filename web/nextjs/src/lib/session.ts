import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { serverEnv } from "@/envConfig";
import { UserType } from "@/types/user";

export interface SessionData {
  // The JWT token for the user, used to authenticate the user in the demo app.
  token: string;
  // The type of user, used to determine which user to get the signed app url for
  userType: UserType;
  counselUserId: string;
  // "apiKey" = demo server handles Counsel API calls with an API key
  // "jwt"    = Next.js calls Counsel API directly with a signed JWT
  authType: "apiKey" | "jwt";
  // Counsel JWT pre-warmed at login for the "jwt" flow. Used as a cache — if present and not
  // expired it avoids a /token round-trip on chat page load. Never refreshed into the session
  // from the chat page (Server Component can't write cookies in Next.js 15); after it expires
  // a fresh JWT is fetched per-request in memory only.
  counselJwt?: string;
}

export async function getSession() {
  const sessionOptions: SessionOptions = {
    password: serverEnv.IRON_SESSION_PASSWORD,
    cookieName: "auth-session",
    ttl: 60 * 60, // 1 hour
    cookieOptions: {
      // secure only works in `https` environments. localhost is not on `https`
      secure: process.env.NODE_ENV === "production",
    },
  };
  return await getIronSession<SessionData>(await cookies(), sessionOptions);
}
