import { serverEnv } from "@/envConfig";

export const getRevalidateTag = (userId: string) => `signedAppUrl-${userId}`;

// Set to false to disable caching of the signed app url.
const ENABLE_CACHE = true;

export async function getCounselSignedAppUrl(userId: string) {
  console.log("Getting signed app url for user", userId);
  const response = await fetch(`${serverEnv.SERVER_HOST}/chat/signedAppUrl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
    }),
    cache: ENABLE_CACHE ? "force-cache" : "no-store",
    next: ENABLE_CACHE
      ? {
          // 24 hours - Technically you can instead this to cache for even longer but you have to invalidate the cache if you sign the user out.
          revalidate: 60 * 60 * 24,
          // This is a unique tag for the signed app url that we use to invalidate the cache when the user signs out.
          tags: [getRevalidateTag(userId)],
        }
      : undefined,
  });

  if (!response.ok) {
    throw new Error(`Failed to get signed app url: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Signed app url", data.url);
  return data.url;
}

export async function createCounselUser(userId: string) {
  const response = await fetch(`${serverEnv.SERVER_HOST}/chat/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create counsel user: ${response.status} ${response.statusText}`);
  }
  console.log("Counsel user created", await response.json());
}
