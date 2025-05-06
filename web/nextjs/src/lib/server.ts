const ServerApiHost = "http://localhost:4003";

export const getRevalidateTag = (userId: string) => `signedAppUrl-${userId}`;

export async function getCounselSignedAppUrl(userId: string) {
  console.log("Getting signed app url for user", userId);
  const response = await fetch(`${ServerApiHost}/chat/signedAppUrl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
    }),
    cache: "force-cache",
    next: {
      // 24 hours - Technically you can instead this to cache for even longer but you have to invalidate the cache if you sign the user out.
      revalidate: 60 * 60 * 24,
      // This is a unique tag for the signed app url that we use to invalidate the cache when the user signs out.
      tags: [getRevalidateTag(userId)],
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get signed app url: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.url;
}
