import { z } from "zod";
import { getAccessCodeConfig } from "@/envConfig";
import { v4 as uuidv4 } from "uuid";
import { User } from "@/db/schemas/user";
import { parseName } from "@/lib/name";
import { fetchWithRetry } from "@/lib/http";

export const UserTypeSchema = z.enum(["main", "onboarding"]);
export type UserType = z.infer<typeof UserTypeSchema>;

const getRequestUrl = (apiUrl: string, path: string) => `${apiUrl}${path}`;

const getRequestHeaders = ({
  idempotencyKey,
  apiKey,
}: {
  idempotencyKey?: string;
  apiKey: string;
}) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
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

/**
 * Get config for an access code
 * Returns both apiKey and apiUrl from the access code configuration
 */
function getAccessCodeConfigForRequest(accessCode: string): { apiKey: string; apiUrl: string } {
  const config = getAccessCodeConfig(accessCode);

  if (!config) {
    throw new Error(`No config found for access code "${accessCode}".`);
  }

  return {
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
  };
}

export async function getCounselSignedAppUrl({
  userId,
  accessCode,
}: {
  userId: string;
  accessCode: string;
}) {
  console.log("Getting signed app url for user", userId);
  const { apiKey, apiUrl } = getAccessCodeConfigForRequest(accessCode);
  const response = await fetchWithRetry(getRequestUrl(apiUrl, `/v1/user/${userId}/signedAppUrl`), {
    method: "POST",
    headers: getRequestHeaders({ apiKey }),
    // Empty body is required by Counsel
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Request to get signed app url failed: ${response.status} ${
        response.statusText
      } ${JSON.stringify(error)}`
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
  const { apiKey, apiUrl } = getAccessCodeConfigForRequest(accessCode);
  const response = await fetchWithRetry(getRequestUrl(apiUrl, `/v1/user/${userId}/signOut`), {
    method: "POST",
    headers: getRequestHeaders({ apiKey }),
    // Empty body is required by Counsel
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Request to sign out user failed: ${response.status} ${response.statusText} ${JSON.stringify(error)}`
    );
  }
}

export async function createCounselUser(user: User, accessCode: string) {
  const { apiKey, apiUrl } = getAccessCodeConfigForRequest(accessCode);
  const response = await fetchWithRetry(getRequestUrl(apiUrl, `/v1/user`), {
    method: "POST",
    // Use the user id as the idempotency key
    headers: getRequestHeaders({ apiKey }),
    body: JSON.stringify(convertUserToCounselUser(user)),
  });
  if (!response.ok) {
    // Handle duplicate user case (this can happen on server restarts where the in-memory DB is reset)
    if (response.status === 409) {
      console.log("User already exists, returning existing user", user.id);
      // User already exists, return the existing user
      return UserResponse.parse({
        id: user.id,
      });
    }

    const error = await response.json();
    throw new Error(
      `Request to create user failed: ${response.status} ${
        response.statusText
      } ${JSON.stringify(error)}`
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
  const { apiKey, apiUrl } = getAccessCodeConfigForRequest(accessCode);
  const response = await fetchWithRetry(getRequestUrl(apiUrl, `/v1/user/draft`), {
    method: "POST",
    // Use the user id as the idempotency key
    headers: getRequestHeaders({ apiKey }),
    body: JSON.stringify(convertUserToCounselDraftUser(user)),
  });
  if (!response.ok) {
    // Handle duplicate user case (this can happen on server restarts where the in-memory DB is reset)
    if (response.status === 409) {
      console.log("User already exists, returning existing user", user.id);
      // User already exists, return the existing user
      return UserResponse.parse({
        id: user.id,
      });
    }
    const error = await response.json();
    throw new Error(
      `Request to create draft user failed: ${response.status} ${
        response.statusText
      } ${JSON.stringify(error)}`
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
