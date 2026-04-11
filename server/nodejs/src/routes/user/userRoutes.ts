import { Elysia } from "elysia";
import { withAuth } from "@/lib/user-session";
import { signUpHandler, SignUpBodySchema } from "./signUp";
import { signOutHandler } from "./signOut";
import { signedAppUrlHandler, SessionDataSchema } from "./signedAppUrl";
import { threadsHandler } from "./threads";

export const UserPlugin = new Elysia({ prefix: "/user" })
  // public — no auth required; body validated by Elysia before handler runs
  .post(
    "/signUp",
    ({ body, status }) => signUpHandler({ body, error: status }),
    { body: SignUpBodySchema }
  )
  // protected — withAuth injects typed `user` into context for all routes below
  .use(withAuth)
  .post("/signOut", ({ user }) => signOutHandler({ user }))
  .post(
    "/signedAppUrl",
    ({ user, body }) => signedAppUrlHandler({ user, body }),
    { body: SessionDataSchema }
  )
  .get("/threads", ({ user }) => threadsHandler({ user }));
