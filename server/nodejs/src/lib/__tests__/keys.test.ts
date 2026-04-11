import { describe, expect, test } from "vitest";
import { setupTestEnv } from "../__mocks__/envConfig";

setupTestEnv();

describe("keys", () => {
  describe("signCounselJwt", () => {
    test("should return a non-empty JWT string", async () => {
      const { signCounselJwt } = await import("../keys");
      const jwt = await signCounselJwt(
        "test-user-id",
        "https://local-test-partner.example.com"
      );
      expect(typeof jwt).toBe("string");
      expect(jwt.length).toBeGreaterThan(0);
      // JWT format: header.payload.signature (3 parts separated by dots)
      expect(jwt.split(".").length).toBe(3);
    });

    test("should produce different JWTs for different subjects", async () => {
      const { signCounselJwt } = await import("../keys");
      const jwt1 = await signCounselJwt(
        "user-1",
        "https://local-test-partner.example.com"
      );
      const jwt2 = await signCounselJwt(
        "user-2",
        "https://local-test-partner.example.com"
      );
      expect(jwt1).not.toBe(jwt2);
    });
  });

  describe("getPublicJwk", () => {
    test("should return an object with keys array structure", async () => {
      const { getPublicJwk } = await import("../keys");
      const jwk = await getPublicJwk();
      expect(jwk).not.toBeNull();
      expect(jwk.kid).toBe("rsa-256-key-1");
      expect(jwk.use).toBe("sig");
      expect(jwk.alg).toBe("RS256");
    });

    test("should return cached result on subsequent calls", async () => {
      const { getPublicJwk } = await import("../keys");
      const jwk1 = await getPublicJwk();
      const jwk2 = await getPublicJwk();
      expect(jwk1).toBe(jwk2);
    });
  });
});
