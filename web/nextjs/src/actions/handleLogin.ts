"use server";

import { serverEnv } from "@/envConfig";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { createCounselUser } from "@/lib/server";

const FormDataSchema = z.object({
  accessCode: z.string().min(1),
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

  // Check if the access code is correct, case insensitive
  if (accessCode.toLowerCase() !== serverEnv.ACCESS_CODE.toLowerCase()) {
    return { message: "Invalid access code" };
  }

  // Generate a random user id each time someone logs in
  const userId = uuidv4();

  // Create a user in the counsel app
  await createCounselUser(userId);

  // start an iron session, save creds to cookie
  const session = await getSession();
  session.userId = userId;
  await session.save();

  // redirect to the dashboard, user is now authenticated.
  redirect("/dashboard");
}
