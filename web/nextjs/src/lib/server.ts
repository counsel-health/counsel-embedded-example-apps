import { IronSession } from "iron-session";
import { decodeJwt } from "jose";
import { serverEnv } from "@/envConfig";
import { fetchWithRetry } from "./http";
import { UserType } from "@/types/user";
import { SessionData } from "@/lib/session";
import {
  SignedAppUrlResponseSchema,
  CounselTokenResponseSchema,
  SignUpResponseSchema,
} from "@/lib/schemas";

//================================================================================
// Counsel Demo Server API Calls
//================================================================================

const CACHE_TAG_CHAT_SIGNED_APP_URL = "chat-signed-app-url";

export const getChatSignedAppUrlCacheKey = (counselUserId: string) =>
  `${CACHE_TAG_CHAT_SIGNED_APP_URL}-${counselUserId}`;

// Refresh 5 min before expiry to avoid using a JWT that's about to expire mid-request
const JWT_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

function getAuthorizationHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function isCounselJwtValid(jwt: string): boolean {
  try {
    const payload = decodeJwt(jwt);
    return (
      typeof payload.exp === "number" &&
      Date.now() < payload.exp * 1000 - JWT_EXPIRY_BUFFER_MS
    );
  } catch {
    return false;
  }
}

async function fetchCounselJwt(sessionToken: string): Promise<string> {
  const resp = await fetchWithRetry(`${serverEnv.SERVER_HOST}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthorizationHeader(sessionToken),
    },
    body: JSON.stringify({}),
  });
  if (!resp.ok) {
    throw new Error(
      `Failed to fetch Counsel JWT: ${resp.status} ${resp.statusText}`
    );
  }
  const { token } = CounselTokenResponseSchema.parse(await resp.json());
  return token;
}

/**
 * Pre-warms the Counsel JWT into the session at login so the first chat page load is fast.
 * Mutates session.counselJwt but does NOT call session.save() — the caller (handleLogin,
 * a Server Action) is responsible for saving.
 */
export async function prewarmSessionJwt(
  session: IronSession<SessionData>
): Promise<void> {
  if (session.authType !== "jwt") return;
  session.counselJwt = await fetchCounselJwt(session.token);
}

/**
 * @description Get the signed app url for a user.
 *
 * Two flows depending on authType:
 * - "apiKey": proxied through the demo server (demo server calls Counsel API with API key)
 * - "jwt": calls Counsel API directly with a Counsel JWT
 *
 * JWT caching strategy for the "jwt" flow:
 * - At login, handleLogin pre-warms the JWT into session.counselJwt (saved via Server Action).
 * - On the chat page, if the cached JWT is still valid it's used directly (fast, no extra call).
 * - If the cached JWT is expired, a fresh one is fetched from /token and used in-memory only.
 * Cached in NextJS so the same URL is reused across navigations until invalidated.
 */
export async function getCounselSignedAppUrl(
  session: IronSession<SessionData>
) {
  const { token, counselUserId, authType, counselJwt } = session;

  if (authType === "jwt") {
    const jwt =
      counselJwt && isCounselJwtValid(counselJwt)
        ? counselJwt
        : await fetchCounselJwt(token);

    // jwt auth flow: calls the Counsel API directly (no demo server proxy)
    const resp = await fetchWithRetry(
      `${serverEnv.COUNSEL_API_URL}/v1/user/${counselUserId}/signedAppUrl`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthorizationHeader(jwt),
        },
        body: JSON.stringify({}),
        cache: "default",
        next: {
          revalidate: 3600,
          tags: [getChatSignedAppUrlCacheKey(counselUserId)],
        },
      }
    );
    if (!resp.ok) {
      throw new Error(
        `Failed to get signed app url: ${resp.status} ${resp.statusText}`
      );
    }
    return SignedAppUrlResponseSchema.parse(await resp.json()).url;
  }

  // apiKey flow: demo server proxies the request using the API key
  const resp = await fetchWithRetry(
    `${serverEnv.SERVER_HOST}/user/signedAppUrl`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthorizationHeader(token),
      },
      body: JSON.stringify({}),
      cache: "default",
      next: {
        revalidate: 3600,
        tags: [getChatSignedAppUrlCacheKey(counselUserId)],
      },
    }
  );
  if (!resp.ok) {
    throw new Error(
      `Failed to get signed app url: ${resp.status} ${resp.statusText}`
    );
  }
  return SignedAppUrlResponseSchema.parse(await resp.json()).url;
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
  | {
      success: true;
      data: {
        token: string;
        userType: UserType;
        counselUserId: string;
        authType: "apiKey" | "jwt";
      };
    }
  | { success: false; error: unknown }
> {
  try {
    const data = await fetchFromCounselServer("user/signUp", "POST", {
      userId,
      accessCode,
    });
    return { success: true, data: SignUpResponseSchema.parse(data) };
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
    next: cache
      ? { revalidate: cache.revalidate, tags: cache.tags }
      : undefined,
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
