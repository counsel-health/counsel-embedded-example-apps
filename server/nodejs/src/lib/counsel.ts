import { z } from "zod";
import { env } from "@/envConfig";
import { v4 as uuidv4 } from "uuid";
import { User } from "@/db/schemas/user";
import { parseName } from "@/lib/name";
import { fetchWithRetry } from "@/lib/http";

const CounselApiHost = env.COUNSEL_API_HOST;

const getRequestUrl = (path: string) => `${CounselApiHost}${path}`;

const getRequestHeaders = (idempotencyKey?: string) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.COUNSEL_API_KEY}`,
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

export async function getCounselSignedAppUrl(userId: string) {
  console.log("Getting signed app url for user", userId);
  const response = await fetchWithRetry(getRequestUrl(`/v1/user/${userId}/signedAppUrl`), {
    method: "POST",
    headers: getRequestHeaders(),
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

export async function signOutCounselUser(userId: string) {
  const response = await fetchWithRetry(getRequestUrl(`/v1/user/${userId}/signOut`), {
    method: "POST",
    headers: getRequestHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Request to sign out user failed: ${response.status} ${response.statusText} ${JSON.stringify(error)}`
    );
  }
}

export async function createCounselUser(user: User) {
  const response = await fetchWithRetry(getRequestUrl(`/v1/user`), {
    method: "POST",
    // Use the user id as the idempotency key
    headers: getRequestHeaders(user.id),
    body: JSON.stringify(convertUserToCounselUser(user)),
  });
  if (!response.ok) {
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
