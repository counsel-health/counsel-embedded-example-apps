import { User } from "@/db/schemas/user";
import { getAccessCodeConfig } from "@/envConfig";
import { fetchWithRetry } from "@/lib/http";
import { counselLogger } from "@/lib/logger";
import { parseName } from "@/lib/name";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { signCounselJwt } from "./keys";

export const UserTypeSchema = z.enum(["main", "onboarding"]);
export type UserType = z.infer<typeof UserTypeSchema>;

const getRequestUrl = (apiUrl: string, path: string) => `${apiUrl}${path}`;

function getConfig(accessCode: string) {
  const config = getAccessCodeConfig(accessCode);
  if (!config) throw new Error(`No config found for access code "${accessCode}".`);
  return config;
}

const getRequestHeaders = async (
  accessCode: string,
  idempotencyKey?: string,
): Promise<Record<string, string>> => {
  const config = getConfig(accessCode);

  // API key auth: use apiKey as Bearer token when present
  // JWT auth only: sign a JWT with issuer when apiKey is not present
  const { apiKey, issuer } = config;
  if (!apiKey && !issuer) {
    throw new Error(`Access code "${accessCode}" must have either apiKey or issuer configured`);
  }
  const authToken = apiKey ? apiKey : await signCounselJwt("server", issuer!);

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
    "Idempotency-Key": idempotencyKey ?? uuidv4(),
  };
};

const SignedAppUrlResponse = z.object({
  url: z.string(),
  expiry: z.string(),
});

// Limited response schema for the user for now
const UserResponse = z.object({
  id: z.string(),
});

const DraftUserResponse = z.object({
  id: z.string(),
});

function getApiUrl(accessCode: string): string {
  return getConfig(accessCode).apiUrl;
}

const ERROR_BODY_MAX_LEN = 500;

/** Prefer JSON when the body parses; otherwise include truncated text (e.g. HTML from a gateway). */
async function readHttpErrorDetail(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) return "";
  const trimmed = text.trim();
  try {
    return JSON.stringify(JSON.parse(trimmed));
  } catch {
    return trimmed.length > ERROR_BODY_MAX_LEN
      ? `${trimmed.slice(0, ERROR_BODY_MAX_LEN)}…`
      : trimmed;
  }
}

export async function getCounselUserThreads({
  userId,
  accessCode,
}: {
  userId: string;
  accessCode: string;
}) {
  const apiUrl = getApiUrl(accessCode);
  const response = await fetchWithRetry(getRequestUrl(apiUrl, `/v1/user/${userId}/threads`), {
    method: "GET",
    headers: await getRequestHeaders(accessCode),
  });
  if (!response.ok) {
    const detail = await readHttpErrorDetail(response);
    throw new Error(
      `Request to get user threads failed: ${response.status} ${
        response.statusText
      }${detail ? ` ${detail}` : ""}`,
    );
  }
  return await response.json();
}

export async function getCounselSignedAppUrl({
  userId,
  accessCode,
  sessionData,
}: {
  userId: string;
  accessCode: string;
  sessionData?: Record<string, unknown>;
}) {
  counselLogger.debug({ userId }, "Getting signed app url for user");
  const apiUrl = getApiUrl(accessCode);
  const response = await fetchWithRetry(getRequestUrl(apiUrl, `/v1/user/${userId}/signedAppUrl`), {
    method: "POST",
    headers: await getRequestHeaders(accessCode),
    body: JSON.stringify(sessionData ?? {}),
  });
  if (!response.ok) {
    const detail = await readHttpErrorDetail(response);
    throw new Error(
      `Request to get signed app url failed: ${response.status} ${
        response.statusText
      }${detail ? ` ${detail}` : ""}`,
    );
  }
  const data = await response.json();
  return SignedAppUrlResponse.parse(data);
}

export async function signOutCounselUser({
  userId,
  accessCode,
}: {
  userId: string;
  accessCode: string;
}) {
  const apiUrl = getApiUrl(accessCode);
  const response = await fetchWithRetry(getRequestUrl(apiUrl, `/v1/user/${userId}/signOut`), {
    method: "POST",
    headers: await getRequestHeaders(accessCode),
    // Empty body is required by Counsel
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const detail = await readHttpErrorDetail(response);
    throw new Error(
      `Request to sign out user failed: ${response.status} ${response.statusText}${
        detail ? ` ${detail}` : ""
      }`,
    );
  }
}

export async function createCounselUser(user: User, accessCode: string) {
  const apiUrl = getApiUrl(accessCode);
  const response = await fetchWithRetry(getRequestUrl(apiUrl, `/v1/user`), {
    method: "POST",
    // Use the user id as the idempotency key
    headers: await getRequestHeaders(accessCode),
    body: JSON.stringify(convertUserToCounselUser(user)),
  });
  if (!response.ok) {
    // Handle duplicate user case (this can happen on server restarts where the in-memory DB is reset)
    if (response.status === 409) {
      counselLogger.info({ userId: user.id }, "User already exists, returning existing user");
      // User already exists, return the existing user
      return UserResponse.parse({
        id: user.id,
      });
    }

    const detail = await readHttpErrorDetail(response);
    throw new Error(
      `Request to create user failed: ${response.status} ${
        response.statusText
      }${detail ? ` ${detail}` : ""}`,
    );
  }
  const data = await response.json();
  return UserResponse.parse(data);
}

function convertUserToCounselUser(user: User) {
  const { firstName, lastName } = parseName(user.name);
  return {
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    phone: user.info.phone,
    dob: user.info.dob,
    email: user.email,
    sex_assigned_at_birth: user.info.sex,
    addresses: [
      {
        line1: user.info.address.line1,
        line2: user.info.address.line2,
        city: user.info.address.city,
        state: user.info.address.state,
        zip: user.info.address.zip,
      },
    ],
    medical_profile: {
      conditions: user.info.medicalProfile.conditions,
      medications: user.info.medicalProfile.medications,
    },
  };
}

export async function createCounselDraftUser(user: User, accessCode: string) {
  const apiUrl = getApiUrl(accessCode);
  const response = await fetchWithRetry(getRequestUrl(apiUrl, `/v1/user/draft`), {
    method: "POST",
    // Use the user id as the idempotency key
    headers: await getRequestHeaders(accessCode),
    body: JSON.stringify(convertUserToCounselDraftUser(user)),
  });
  if (!response.ok) {
    // Handle duplicate user case (this can happen on server restarts where the in-memory DB is reset)
    if (response.status === 409) {
      counselLogger.info({ userId: user.id }, "User already exists, returning existing user");
      // User already exists, return the existing user
      return UserResponse.parse({
        id: user.id,
      });
    }
    const detail = await readHttpErrorDetail(response);
    throw new Error(
      `Request to create draft user failed: ${response.status} ${
        response.statusText
      }${detail ? ` ${detail}` : ""}`,
    );
  }
  const data = await response.json();
  return DraftUserResponse.parse(data);
}

/**
 * @description Convert a user to a Counsel draft user
 * Draft users are empty users that have to go through the Counsel onboarding process
 */
function convertUserToCounselDraftUser(user: User) {
  return {
    id: user.id,
  };
}
