/**
 * Scenario 02: Sign-up flow — exercises JWT signing + DB write + Counsel API call.
 * Requires ACCESS_CODE env var pointing to a valid access code.
 * Requires a live Counsel API to be accessible from the server.
 */
import { check, sleep } from "k6";
import { signUp } from "../utils/helpers.js";

const ACCESS_CODE = __ENV.ACCESS_CODE;

export const options = {
  stages: [
    { duration: "15s", target: 5 }, // ramp up
    { duration: "30s", target: 5 }, // hold
    { duration: "15s", target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  if (!ACCESS_CODE) {
    console.error("ACCESS_CODE env var is required for this scenario");
    return;
  }

  const result = signUp(ACCESS_CODE);
  check(result, {
    "signUp returned a token": (r) => r !== null && typeof r.token === "string",
    "signUp returned counselUserId": (r) =>
      r !== null && typeof r.counselUserId === "string",
  });
  sleep(0.5);
}
