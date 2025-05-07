"use server";

import { getUser } from "@/lib/mocks";
import { revalidateTag } from "next/cache";
import { getRevalidateTag } from "@/lib/server";

export async function signOut() {
  const user = getUser();
  // Invalidate the signed app url cache when the user signs out.
  // This forces nextJS to re-fetch the signed app url from the server.
  revalidateTag(getRevalidateTag(user.id));
}
