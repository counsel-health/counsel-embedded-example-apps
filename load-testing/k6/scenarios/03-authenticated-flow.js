/**
 * Scenario 03: Authenticated flow — full hot path: signUp → signedAppUrl.
 * This is the primary before/after comparison scenario for the Express → Elysia migration.
 * Requires ACCESS_CODE env var and a live Counsel API.
 */
import { check, sleep } from "k6";
import http from "k6/http";
import { authHeaders, signUp } from "../utils/helpers.js";

const BASE_URL = __ENV.BASE_URL || "http://localhost:4003";
const ACCESS_CODE = __ENV.ACCESS_CODE;

export const options = {
  stages: [
    { duration: "15s", target: 10 }, // ramp up
    { duration: "30s", target: 10 }, // hold
    { duration: "15s", target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"],
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  if (!ACCESS_CODE) {
    console.error("ACCESS_CODE env var is required for this scenario");
    return;
  }

  // Step 1: sign up to get a JWT
  const auth = signUp(ACCESS_CODE);
  if (!auth) return;

  // Step 2: call the authenticated hot path — get a signed app URL
  const res = http.post(
    `${BASE_URL}/user/signedAppUrl`,
    JSON.stringify({}),
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(auth.token),
      },
    }
  );

  check(res, {
    "signedAppUrl status 200": (r) => r.status === 200,
    "signedAppUrl has url": (r) => typeof r.json("url") === "string",
  });

  sleep(0.1);
}
