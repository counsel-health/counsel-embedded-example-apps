/**
 * Scenario 01: Health endpoint — pure throughput baseline.
 * No external dependencies. Use this to measure raw server overhead.
 */
import { check, sleep } from "k6";
import http from "k6/http";

const BASE_URL = __ENV.BASE_URL || "http://localhost:4003";

export const options = {
  stages: [
    { duration: "15s", target: 20 }, // ramp up
    { duration: "30s", target: 20 }, // hold
    { duration: "15s", target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<100"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "body is ok": (r) => r.json("message") === "ok",
  });
  sleep(0.05);
}
