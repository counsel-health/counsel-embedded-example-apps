import { test, describe } from "node:test";
import assert from "node:assert";
import { setupTestEnv } from "@/lib/__mocks__/envConfig";

setupTestEnv();

describe("keys", () => {
  describe("signCounselJwt", () => {
    test("should return a non-empty JWT string", async () => {
      const { signCounselJwt } = await import("../keys");
      const jwt = await signCounselJwt("test-user-id", "https://local-test-partner.example.com");
      assert.strictEqual(typeof jwt, "string");
      assert.ok(jwt.length > 0);
      // JWT format: header.payload.signature (3 parts separated by dots)
      const parts = jwt.split(".");
      assert.strictEqual(parts.length, 3);
    });

    test("should produce different JWTs for different subjects", async () => {
      const { signCounselJwt } = await import("../keys");
      const jwt1 = await signCounselJwt("user-1", "https://local-test-partner.example.com");
      const jwt2 = await signCounselJwt("user-2", "https://local-test-partner.example.com");
      assert.notStrictEqual(jwt1, jwt2);
    });
  });

  describe("getPublicJwk", () => {
    test("should return an object with keys array structure", async () => {
      const { getPublicJwk } = await import("../keys");
      const jwk = await getPublicJwk();
      assert.ok(typeof jwk === "object");
      assert.ok(jwk !== null);
      assert.strictEqual(jwk.kid, "rsa-256-key-1");
      assert.strictEqual(jwk.use, "sig");
      assert.strictEqual(jwk.alg, "RS256");
    });

    test("should return cached result on subsequent calls", async () => {
      const { getPublicJwk } = await import("../keys");
      const jwk1 = await getPublicJwk();
      const jwk2 = await getPublicJwk();
      assert.strictEqual(jwk1, jwk2);
    });
  });
});
