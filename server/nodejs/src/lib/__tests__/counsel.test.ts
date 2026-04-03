import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { mockAccessCodeConfigs } from "../__mocks__/accessCodeConfigs";
import { setupTestEnv } from "../__mocks__/envConfig";

describe("access code config lookup", () => {
  describe("get access code config logic", () => {
    test("should find config when access code exists", () => {
      const config = mockAccessCodeConfigs["MAIN01"];

      expect(config).toBeTruthy();
      expect(config.client).toBe("main");
      expect(config.apiUrl).toBe("https://test-api.counselhealth.com");
    });

    test("should return undefined when access code not found", () => {
      const config = mockAccessCodeConfigs["INVALID" as keyof typeof mockAccessCodeConfigs];

      expect(config).toBeUndefined();
    });
  });

  describe("multiple access codes with different apiUrls support", () => {
    test("should support multiple access codes with different apiUrls", () => {
      const mainDev = mockAccessCodeConfigs.MAIN01;
      const onboardingLocal = mockAccessCodeConfigs.ONBR02;
      const client1Local = mockAccessCodeConfigs.CLNT01;

      expect(mainDev).toBeTruthy();
      expect(onboardingLocal).toBeTruthy();
      expect(client1Local).toBeTruthy();
      expect(mainDev.apiUrl).toBe("https://test-api.counselhealth.com");
      expect(onboardingLocal.apiUrl).toBe("https://local-api.counselhealth.com");
      expect(client1Local.apiUrl).toBe("https://local.counselhealth.com");
      expect(mainDev.apiUrl).not.toBe(onboardingLocal.apiUrl);
      expect(onboardingLocal.apiUrl).not.toBe(client1Local.apiUrl);
    });

    test("should support multiple access codes pointing to same apiUrl", () => {
      const mainDev = mockAccessCodeConfigs.MAIN01;
      const onboardingDev = mockAccessCodeConfigs.ONBR01;
      const mainProd = mockAccessCodeConfigs.MAIN02;

      expect(mainDev).toBeTruthy();
      expect(onboardingDev).toBeTruthy();
      expect(mainProd).toBeTruthy();
      expect(mainDev.apiUrl).toBe(onboardingDev.apiUrl);
      expect(mainDev.apiUrl).toBe(mainProd.apiUrl);
      expect(onboardingDev.apiUrl).toBe("https://test-api.counselhealth.com");
      expect(mainDev.client).not.toBe(onboardingDev.client);
    });
  });
});

describe("counsel API functions", () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getCounselSignedAppUrl", () => {
    test("should return url and expiry when API succeeds", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              url: "https://embed.counsel.test/signed",
              expiry: "2025-01-01T00:00:00Z",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
      );

      const { getCounselSignedAppUrl } = await import("../counsel");
      const result = await getCounselSignedAppUrl({
        userId: "counsel-user-123",
        accessCode: "MAIN01",
      });

      expect(result.url).toBe("https://embed.counsel.test/signed");
      expect(result.expiry).toBe("2025-01-01T00:00:00Z");
    });

    test("should throw when access code is invalid", async () => {
      const { getCounselSignedAppUrl } = await import("../counsel");

      await expect(
        getCounselSignedAppUrl({ userId: "user-123", accessCode: "INVALID" })
      ).rejects.toThrow(/No config found for access code/);
    });

    test("should use apiKey auth when apiKey is in config", async () => {
      let capturedAuth: string | undefined;
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(async (_: RequestInfo | URL, init?: RequestInit) => {
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
        })
      );

      const { getCounselSignedAppUrl } = await import("../counsel");
      await getCounselSignedAppUrl({ userId: "counsel-user-123", accessCode: "APIK01" });

      expect(capturedAuth).toMatch(/^Bearer /);
      expect(capturedAuth).toBe("Bearer sk_test_api_key_123");
    });

    test("should throw when API returns error", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          })
        )
      );

      const { getCounselSignedAppUrl } = await import("../counsel");

      await expect(
        getCounselSignedAppUrl({ userId: "user-123", accessCode: "MAIN01" })
      ).rejects.toThrow(/Request to get signed app url failed/);
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
        medicalProfile: { conditions: ["diabetes"], medications: ["metformin"] },
      },
    };

    test("should return user id when creation succeeds", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ id: "test-user-id" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
      );

      const { createCounselUser } = await import("../counsel");
      const result = await createCounselUser(mockUser, "MAIN01");

      expect(result.id).toBe("test-user-id");
    });

    test("should return existing user when API returns 409", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("Conflict", { status: 409 }))
      );

      const { createCounselUser } = await import("../counsel");
      const result = await createCounselUser(mockUser, "MAIN01");

      expect(result.id).toBe("test-user-id");
    });

    test("should send correct user payload structure", async () => {
      let capturedBody: unknown = null;
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(async (_: RequestInfo | URL, init?: RequestInit) => {
          capturedBody = init?.body ? JSON.parse(init.body as string) : null;
          return new Response(JSON.stringify({ id: "test-user-id" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        })
      );

      const { createCounselUser } = await import("../counsel");
      await createCounselUser(mockUser, "MAIN01");

      expect(capturedBody).toBeTruthy();
      const body = capturedBody as Record<string, unknown>;
      expect(body.id).toBe("test-user-id");
      expect(body.first_name).toBe("John");
      expect(body.last_name).toBe("Doe");
      expect(body.email).toBe("john@example.com");
      expect(body.addresses).toEqual([
        { line1: "123 Main St", line2: "Apt 1", city: "San Francisco", state: "CA", zip: "94101" },
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
        address: { line1: "456 Oak Ave", city: "Oakland", state: "CA", zip: "94601" },
        phone: "+18005551234",
        medicalProfile: { conditions: [], medications: [] },
      },
    };

    test("should return user id when creation succeeds", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ id: "draft-user-id" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
      );

      const { createCounselDraftUser } = await import("../counsel");
      const result = await createCounselDraftUser(mockUser, "ONBR01");

      expect(result.id).toBe("draft-user-id");
    });

    test("should send minimal draft user payload", async () => {
      let capturedBody: unknown = null;
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(async (_: RequestInfo | URL, init?: RequestInit) => {
          capturedBody = init?.body ? JSON.parse(init.body as string) : null;
          return new Response(JSON.stringify({ id: "draft-user-id" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        })
      );

      const { createCounselDraftUser } = await import("../counsel");
      await createCounselDraftUser(mockUser, "ONBR01");

      expect(capturedBody).toEqual({ id: "draft-user-id" });
    });
  });
});
