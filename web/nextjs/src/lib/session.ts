import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { serverEnv } from "@/envConfig";
import { UserType } from "@/types/user";

export interface SessionData {
  // The JWT token for the user, used to authenticate the user in the demo app.
  token: string;
  // The type of user, used to determine which user to get the signed app url for
  userType: UserType;
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
