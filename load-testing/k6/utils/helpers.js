import http from "k6/http";

const BASE_URL = __ENV.BASE_URL || "http://localhost:4003";

/**
 * Signs up a new user and returns { token, counselUserId }.
 * Returns null on failure (logs the error).
 */
export function signUp(accessCode) {
  const res = http.post(
    `${BASE_URL}/user/signUp`,
    JSON.stringify({ accessCode }),
    { headers: { "Content-Type": "application/json" } }
  );

  if (res.status !== 200) {
    console.error(`signUp failed: ${res.status} ${res.body}`);
    return null;
  }

  const body = res.json();
  return { token: body.token, counselUserId: body.counselUserId };
}

/**
 * Returns an Authorization header object for a given Bearer token.
 */
export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}
