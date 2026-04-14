import { withAuth } from "@/lib/user-session";
import { Elysia } from "elysia";
import { z } from "zod";
import { signOutHandler } from "./signOut";
import { SignUpBodySchema, signUpHandler, SignUpResponseSchema } from "./signUp";
import {
  SessionDataSchema,
  signedAppUrlHandler,
  SignedAppUrlResponseSchema,
} from "./signedAppUrl";
import {
  CreateThreadBodySchema,
  createThreadHandler,
  CreateThreadResponseSchema,
  threadsHandler,
} from "./threads";

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
  .get("/threads", ({ user }) => threadsHandler({ user }))
  .post(
    "/threads",
    ({ user, body }) => createThreadHandler({ user, body }),
    { body: CreateThreadBodySchema, response: CreateThreadResponseSchema }
  );
