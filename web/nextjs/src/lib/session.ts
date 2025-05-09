import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { serverEnv } from "@/envConfig";

export interface SessionData {
  userId: string;
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
