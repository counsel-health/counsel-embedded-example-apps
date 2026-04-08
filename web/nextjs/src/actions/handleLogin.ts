"use server";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { signUpCounselUser, prewarmSessionJwt } from "@/lib/server";

const FormDataSchema = z.object({
  accessCode: z.string().length(6),
});

export async function handleLogin(_: unknown, formData: FormData) {
  const parsedResponse = FormDataSchema.safeParse({
    accessCode: formData.get("accessCode"),
  });

  if (!parsedResponse.success) {
    console.error("Invalid input", parsedResponse.error);
    return { message: "Invalid access code" };
  }

  const { accessCode } = parsedResponse.data;

  // Generate a random user id each time someone logs in
  const userId = uuidv4();

  console.log("Attempting to sign up user", userId);

  // Create a user in the counsel app

  const resp = await signUpCounselUser(userId, accessCode);
  if (!resp.success) {
    console.warn("Failed to sign up user", resp.error);
    return { message: "Invalid access code" };
  }

  // start an iron session, save creds to cookie
  const session = await getSession();
  session.token = resp.data.token;
  session.userType = resp.data.userType;
  session.counselUserId = resp.data.counselUserId;
  session.authType = resp.data.authType;
  session.navMode = resp.data.navMode;
  // Pre-warm the Counsel JWT for the jwt flow so the first chat page load is fast.
  // session.save() below persists it — allowed here because handleLogin is a Server Action.
  await prewarmSessionJwt(session);
  await session.save();

  // redirect to the dashboard, user is now authenticated.
  redirect(session.navMode === "integrated" ? "/integrated/chat" : "/dashboard");
}
