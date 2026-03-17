import { serverEnv } from "@/envConfig";
import { fetchWithRetry } from "./http";
import { UserType } from "@/types/user";

//================================================================================
// Counsel Demo Server API Calls
//================================================================================

const CACHE_TAG_CHAT_SIGNED_APP_URL = "chat-signed-app-url";

export const getChatSignedAppUrlCacheKey = (counselUserId: string) =>
  `${CACHE_TAG_CHAT_SIGNED_APP_URL}-${counselUserId}`;

function getAuthorizationHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * @description Get the signed app url for a user using their JWT token
 *
 * Cached in NextJS so that a signed in user can use the same login across multiple pages, sessions or navigations.
 */
export async function getCounselSignedAppUrl(token: string, counselUserId: string) {
  // 1. Get a short-lived counsel JWT from our demo-server
  const tokenResp = await fetchWithRetry(`${serverEnv.SERVER_HOST}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  if (!tokenResp.ok) {
    throw new Error(`Failed to get Counsel token: ${tokenResp.status} ${tokenResp.statusText}`);
  }
  const tokenData = (await tokenResp.json()) as { token?: string };
  if (!tokenData?.token) {
    throw new Error("Invalid token response from server");
  }
  // 2. Call Counsel API directly with that JWT
  const resp = await fetchWithRetry(
    `${serverEnv.COUNSEL_API_URL}/v1/user/${counselUserId}/signedAppUrl`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.token}`,
      },
      body: JSON.stringify({}),
      cache: "default",
      next: { revalidate: 3600, tags: [getChatSignedAppUrlCacheKey(counselUserId)] },
    }
  );
  if (!resp.ok) {
    throw new Error(`Failed to get signed app url: ${resp.status} ${resp.statusText}`);
  }
  const data = (await resp.json()) as { url?: string };
  if (!data?.url) {
    throw new Error("Invalid signed app url response");
  }
  return data.url;
}

/**
 * @description Sign up a new user in the demo server
 * The user info is mocked out in the demo server and we just create new users based on the userId each time.
 * In your app you would likely want to pass the full user object to your API + Counsel API.
 * In the future, once our demo app has a full sign up flow with user info, we'll swap this to pass the full user object.
 *
 * Returns a JWT token that can be used to authenticate the user in the demo app.
 */
export async function signUpCounselUser(
  userId: string,
  accessCode: string
): Promise<
  | { success: true; data: { token: string; userType: UserType; counselUserId: string } }
  | { success: false; error: unknown }
> {
  try {
    const data = await fetchFromCounselServer<{
      token: string;
      userType: UserType;
      counselUserId: string;
    }>("user/signUp", "POST", {
      userId,
      accessCode,
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * @description Sign out a user from the demo server
 */
export async function signOutCounselUser(token: string) {
  console.log("Signing out user", token);
  await fetchFromCounselServer("user/signOut", "POST", {}, token);
}

//================================================================================
// Helper Functions
//================================================================================

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
  body: unknown,
  // If the request is authenticated, pass the auth token in the headers
  token?: string,
  cache?: {
    tags: string[];
    revalidate?: number;
  }
): Promise<T> {
  const url = `${serverEnv.SERVER_HOST}/${path}`;
  console.log("Fetching from counsel server", url);
  const response = await fetchWithRetry(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? getAuthorizationHeader(token) : {}),
    },
    body: JSON.stringify(body),
    cache: cache ? "default" : "no-store",
    next: cache ? { revalidate: cache.revalidate, tags: cache.tags } : undefined,
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
