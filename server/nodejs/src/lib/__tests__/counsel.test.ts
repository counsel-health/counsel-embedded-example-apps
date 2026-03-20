import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { mockAccessCodeConfigs } from "../__mocks__/accessCodeConfigs";
import { setupTestEnv } from "../__mocks__/envConfig";

describe("access code config lookup", () => {
  describe("get access code config logic", () => {
    test("should find config when access code exists", () => {
      const accessCode = "MAIN01";
      const config = mockAccessCodeConfigs[accessCode];

      assert.ok(config);
      assert.strictEqual(config.client, "main");
      assert.strictEqual(config.apiUrl, "https://test-api.counselhealth.com");
    });

    test("should return undefined when access code not found", () => {
      const accessCode = "INVALID" as keyof typeof mockAccessCodeConfigs;
      const config = mockAccessCodeConfigs[accessCode];

      assert.strictEqual(config, undefined);
    });
  });

  describe("multiple access codes with different apiUrls support", () => {
    test("should support multiple access codes with different apiUrls", () => {
      // Test that we can find different access codes
      const mainDev = mockAccessCodeConfigs.MAIN01;
      const onboardingLocal = mockAccessCodeConfigs.ONBR02;
      const client1Local = mockAccessCodeConfigs.CLNT01;

      assert.ok(mainDev);
      assert.ok(onboardingLocal);
      assert.ok(client1Local);
      assert.strictEqual(mainDev.apiUrl, "https://test-api.counselhealth.com");
      assert.strictEqual(onboardingLocal.apiUrl, "https://local-api.counselhealth.com");
      assert.strictEqual(client1Local.apiUrl, "https://local.counselhealth.com");
      // Different access codes can have different apiUrls
      assert.notStrictEqual(mainDev.apiUrl, onboardingLocal.apiUrl);
      assert.notStrictEqual(onboardingLocal.apiUrl, client1Local.apiUrl);
    });

    test("should support multiple access codes pointing to same apiUrl", () => {
      const mainDev = mockAccessCodeConfigs.MAIN01;
      const onboardingDev = mockAccessCodeConfigs.ONBR01;
      const mainProd = mockAccessCodeConfigs.MAIN02;

      assert.ok(mainDev);
      assert.ok(onboardingDev);
      assert.ok(mainProd);
      // All point to test API
      assert.strictEqual(mainDev.apiUrl, onboardingDev.apiUrl);
      assert.strictEqual(mainDev.apiUrl, mainProd.apiUrl);
      assert.strictEqual(onboardingDev.apiUrl, "https://test-api.counselhealth.com");
      // But have different clients and API keys
      assert.notStrictEqual(mainDev.client, onboardingDev.client);
    });
  });
});

describe("counsel API functions", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("getCounselSignedAppUrl", () => {
    test("should return url and expiry when API succeeds", async () => {
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            url: "https://embed.counsel.test/signed",
            expiry: "2025-01-01T00:00:00Z",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );

      const { getCounselSignedAppUrl } = await import("../counsel");
      const result = await getCounselSignedAppUrl({
        userId: "counsel-user-123",
        accessCode: "MAIN01",
      });

      assert.strictEqual(result.url, "https://embed.counsel.test/signed");
      assert.strictEqual(result.expiry, "2025-01-01T00:00:00Z");
    });

    test("should throw when access code is invalid", async () => {
      const { getCounselSignedAppUrl } = await import("../counsel");

      await assert.rejects(
        () => getCounselSignedAppUrl({ userId: "user-123", accessCode: "INVALID" }),
        /No config found for access code/
      );
    });

    test("should use apiKey auth when apiKey is in config", async () => {
      let capturedAuth: string | undefined;
      globalThis.fetch = async (_: RequestInfo | URL, init?: RequestInit) => {
        capturedAuth = init?.headers
          ? (init.headers as Record<string, string>)["Authorization"]
          : undefined;
        return new Response(
          JSON.stringify({
            url: "https://embed.counsel.test/signed",
            expiry: "2025-01-01T00:00:00Z",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      };

      const { getCounselSignedAppUrl } = await import("../counsel");
      await getCounselSignedAppUrl({
        userId: "counsel-user-123",
        accessCode: "APIK01",
      });

      assert.ok(capturedAuth?.startsWith("Bearer "));
      assert.strictEqual(
        capturedAuth,
        "Bearer sk_test_api_key_123",
        "Should use apiKey as Bearer token"
      );
    });

    test("should throw when API returns error", async () => {
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });

      const { getCounselSignedAppUrl } = await import("../counsel");

      await assert.rejects(
        () => getCounselSignedAppUrl({ userId: "user-123", accessCode: "MAIN01" }),
        /Request to get signed app url failed/
      );
    });
  });

  describe("createCounselUser", () => {
    const mockUser = {
      id: "test-user-id",
      name: "John Doe",
      email: "john@example.com",
      info: {
        dob: "1990-01-01",
        sex: "Male",
        address: {
          line1: "123 Main St",
          line2: "Apt 1",
          city: "San Francisco",
          state: "CA",
          zip: "94101",
        },
        phone: "+18007006000",
        medicalProfile: {
          conditions: ["diabetes"],
          medications: ["metformin"],
        },
      },
    };

    test("should return user id when creation succeeds", async () => {
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ id: "test-user-id" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });

      const { createCounselUser } = await import("../counsel");
      const result = await createCounselUser(mockUser, "MAIN01");

      assert.strictEqual(result.id, "test-user-id");
    });

    test("should return existing user when API returns 409", async () => {
      globalThis.fetch = async () => new Response("Conflict", { status: 409 });

      const { createCounselUser } = await import("../counsel");
      const result = await createCounselUser(mockUser, "MAIN01");

      assert.strictEqual(result.id, "test-user-id");
    });

    test("should send correct user payload structure", async () => {
      let capturedBody: unknown = null;
      globalThis.fetch = async (_: RequestInfo | URL, init?: RequestInit) => {
        capturedBody = init?.body ? JSON.parse(init.body as string) : null;
        return new Response(JSON.stringify({ id: "test-user-id" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const { createCounselUser } = await import("../counsel");
      await createCounselUser(mockUser, "MAIN01");

      assert.ok(capturedBody);
      const body = capturedBody as Record<string, unknown>;
      assert.strictEqual(body.id, "test-user-id");
      assert.strictEqual(body.first_name, "John");
      assert.strictEqual(body.last_name, "Doe");
      assert.strictEqual(body.email, "john@example.com");
      assert.deepStrictEqual(body.addresses, [
        {
          line1: "123 Main St",
          line2: "Apt 1",
          city: "San Francisco",
          state: "CA",
          zip: "94101",
        },
      ]);
    });
  });

  describe("createCounselDraftUser", () => {
    const mockUser = {
      id: "draft-user-id",
      name: "Jane Doe",
      email: "jane@example.com",
      info: {
        dob: "1985-05-15",
        sex: "Female",
        address: {
          line1: "456 Oak Ave",
          city: "Oakland",
          state: "CA",
          zip: "94601",
        },
        phone: "+18005551234",
        medicalProfile: {
          conditions: [],
          medications: [],
        },
      },
    };

    test("should return user id when creation succeeds", async () => {
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ id: "draft-user-id" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });

      const { createCounselDraftUser } = await import("../counsel");
      const result = await createCounselDraftUser(mockUser, "ONBR01");

      assert.strictEqual(result.id, "draft-user-id");
    });

    test("should send minimal draft user payload", async () => {
      let capturedBody: unknown = null;
      globalThis.fetch = async (_: RequestInfo | URL, init?: RequestInit) => {
        capturedBody = init?.body ? JSON.parse(init.body as string) : null;
        return new Response(JSON.stringify({ id: "draft-user-id" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const { createCounselDraftUser } = await import("../counsel");
      await createCounselDraftUser(mockUser, "ONBR01");

      assert.deepStrictEqual(capturedBody, { id: "draft-user-id" });
    });
  });
});
