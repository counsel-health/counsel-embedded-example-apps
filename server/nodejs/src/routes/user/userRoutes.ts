import { Elysia } from "elysia";
import { z } from "zod";
import { withAuth } from "@/lib/user-session";
import { signUpHandler, SignUpBodySchema, SignUpResponseSchema } from "./signUp";
import { signOutHandler } from "./signOut";
import {
  signedAppUrlHandler,
  SessionDataSchema,
  SignedAppUrlResponseSchema,
} from "./signedAppUrl";
import { threadsHandler } from "./threads";

export const UserPlugin = new Elysia({ prefix: "/user" })
  // public — no auth required; body validated by Elysia before handler runs
  .post("/signUp", ({ body }) => signUpHandler({ body }), {
    body: SignUpBodySchema,
    response: SignUpResponseSchema,
  })
  // protected — withAuth injects typed `user` into context for all routes below
  .use(withAuth)
  .post("/signOut", ({ user }) => signOutHandler({ user }), {
    response: z.object({ status: z.literal("ok") }),
  })
  .post(
    "/signedAppUrl",
    ({ user, body }) => signedAppUrlHandler({ user, body }),
    { body: SessionDataSchema, response: SignedAppUrlResponseSchema }
  )
  .get("/threads", ({ user }) => threadsHandler({ user }));
