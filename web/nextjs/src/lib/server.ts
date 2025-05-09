import { serverEnv } from "@/envConfig";
import { fetchWithRetry } from "./http";

//================================================================================
// Counsel Demo Server API Calls
//================================================================================

/**
 * @description Get the signed app url for a user
 *
 * NOTE: this is not cached, it will be re-fetched each time from the Demo Server.
 * It could be cached in NextJS if you want since a signed in user can use the same login
 */
export async function getCounselSignedAppUrl(userId: string) {
  console.log("Getting signed app url for user", userId);
  const resp = await fetchFromCounselServer<{ url: string }>("chat/signedAppUrl", "POST", {
    userId,
  });
  return resp.url;
}

/**
 * @description Create a new user in the demo server
 * The user info is mocked out in the demo server and we just create new users based on the userId each time.
 * In your app you would likely want to pass the full user object to your API + Counsel API.
 * In the future, once our demo app has a full sign up flow with user info, we'll swap this to pass the full user object.
 */
export async function createCounselUser(userId: string) {
  return await fetchFromCounselServer<void>("chat/user", "POST", {
    userId,
  });
}

//================================================================================
// Helper Functions
//================================================================================

function getAuthorizationHeader() {
  return {
    Authorization: `Bearer ${serverEnv.SERVER_BEARER_TOKEN}`,
  };
}

async function safeParseJson<T>(response: Response): Promise<T | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchFromCounselServer<T>(
  path: `${string}/${string}`,
  method: "POST",
  body: unknown
): Promise<T> {
  const url = `${serverEnv.SERVER_HOST}/${path}`;
  console.log("Fetching from counsel server", url);
  const response = await fetchWithRetry(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthorizationHeader(),
    },
    body: JSON.stringify(body),
    // Turn off next.js caching
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await safeParseJson(response);
    console.error("Failed to fetch from counsel server", error, {
      responseStatus: response.status,
      responseStatusText: response.statusText,
    });
    throw new Error(
      `Failed to fetch from counsel server: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log("Fetched from counsel server", data);
  return data;
}
