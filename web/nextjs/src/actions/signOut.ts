"use server";

import { getUser } from "@/lib/mocks";
import { revalidateTag } from "next/cache";
import { getRevalidateTag } from "@/lib/server";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function signOut() {
  const session = await getSession();
  const user = getUser(session.userId);
  // Invalidate the signed app url cache when the user signs out.
  // This forces nextJS to re-fetch the signed app url from the server.
  revalidateTag(getRevalidateTag(user.id));
  // Destroy the session
  session.destroy();

  redirect("/login");
}
