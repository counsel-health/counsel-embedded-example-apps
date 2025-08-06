import { z } from "zod";
import { env } from "@/envConfig";
import { v4 as uuidv4 } from "uuid";
import { User } from "@/db/schemas/user";
import { parseName } from "@/lib/name";
import { fetchWithRetry } from "@/lib/http";

const CounselApiHost = env.COUNSEL_API_HOST;

export const UserTypeSchema = z.enum(["main", "onboarding"]);
export type UserType = z.infer<typeof UserTypeSchema>;

const getRequestUrl = (path: string) => `${CounselApiHost}${path}`;

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

const getApiKey = (userType: UserType) =>
  userType === "main" ? env.COUNSEL_API_KEY : env.COUNSEL_ONBOARDING_API_KEY;

export async function getCounselSignedAppUrl({
  userId,
  userType,
}: {
  userId: string;
  userType: UserType;
}) {
  console.log("Getting signed app url for user", userId);
  const response = await fetchWithRetry(getRequestUrl(`/v1/user/${userId}/signedAppUrl`), {
    method: "POST",
    headers: getRequestHeaders({ apiKey: getApiKey(userType) }),
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
  userType,
}: {
  userId: string;
  userType: UserType;
}) {
  const response = await fetchWithRetry(getRequestUrl(`/v1/user/${userId}/signOut`), {
    method: "POST",
    headers: getRequestHeaders({ apiKey: getApiKey(userType) }),
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

export async function createCounselUser(user: User) {
  const response = await fetchWithRetry(getRequestUrl(`/v1/user`), {
    method: "POST",
    // Use the user id as the idempotency key
    headers: getRequestHeaders({ apiKey: getApiKey("main") }),
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

export async function createCounselDraftUser(user: User) {
  const response = await fetchWithRetry(getRequestUrl(`/v1/user/draft`), {
    method: "POST",
    // Use the user id as the idempotency key
    headers: getRequestHeaders({ apiKey: getApiKey("onboarding") }),
    body: JSON.stringify(convertUserToCounselDraftUser(user)),
  });
  if (!response.ok) {
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
