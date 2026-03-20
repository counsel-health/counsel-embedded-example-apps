import "../test-setup";
import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { getCounselSignedAppUrl, getChatSignedAppUrlCacheKey } from "../server";
import { SignJWT } from "jose";

const originalFetch = globalThis.fetch;

function getUrlString(input: RequestInfo | URL): string {
  return typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
}

// Build a real signed JWT with the given expiry so isCounselJwtValid can decode it
async function makeJwt(expiresInSeconds: number): Promise<string> {
  const secret = new TextEncoder().encode("test-secret");
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(secret);
}

function makeSession(overrides: Partial<{ authType: "apiKey" | "jwt"; counselJwt: string }> = {}) {
  return {
    token: "session-token",
    userType: "main" as const,
    counselUserId: "counsel-user-456",
    authType: "apiKey" as const,
    save: async () => {},
    destroy: async () => {},
    updateConfig: () => {},
    ...overrides,
  };
}

describe("getCounselSignedAppUrl", () => {
  beforeEach(() => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = getUrlString(input);
      if (urlStr.includes("/token")) {
        return new Response(JSON.stringify({ token: "counsel-jwt-from-server" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (urlStr.includes("/signedAppUrl")) {
        return new Response(JSON.stringify({ url: "https://embed.counsel.test/signed" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("Not found", { status: 404 });
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("apiKey flow: should return signed app url via demo server", async () => {
    const url = await getCounselSignedAppUrl(makeSession({ authType: "apiKey" }));
    assert.strictEqual(url, "https://embed.counsel.test/signed");
  });

  test("jwt flow: uses cached counselJwt if still valid (no /token call)", async () => {
    const validJwt = await makeJwt(3600); // 1h from now
    let tokenCalled = false;
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = getUrlString(input);
      if (urlStr.includes("/token")) {
        tokenCalled = true;
        return new Response(JSON.stringify({ token: "should-not-be-called" }), { status: 200 });
      }
      if (urlStr.includes("/signedAppUrl")) {
        return new Response(JSON.stringify({ url: "https://embed.counsel.test/signed" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("Not found", { status: 404 });
    };
    const url = await getCounselSignedAppUrl(
      makeSession({ authType: "jwt", counselJwt: validJwt })
    );
    assert.strictEqual(url, "https://embed.counsel.test/signed");
    assert.strictEqual(tokenCalled, false, "should not call /token when cached JWT is valid");
  });

  test("jwt flow: fetches fresh JWT from /token when session has no counselJwt", async () => {
    const url = await getCounselSignedAppUrl(makeSession({ authType: "jwt" }));
    assert.strictEqual(url, "https://embed.counsel.test/signed");
  });

  test("jwt flow: fetches fresh JWT from /token when cached counselJwt is expired", async () => {
    const expiredJwt = await makeJwt(-60); // expired 1 min ago
    const url = await getCounselSignedAppUrl(
      makeSession({ authType: "jwt", counselJwt: expiredJwt })
    );
    assert.strictEqual(url, "https://embed.counsel.test/signed");
  });

  test("should throw when server returns error", async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = getUrlString(input);
      if (urlStr.includes("/signedAppUrl")) {
        return new Response("Unauthorized", { status: 401 });
      }
      return new Response("Not found", { status: 404 });
    };

    await assert.rejects(
      () => getCounselSignedAppUrl(makeSession()),
      /Failed to get signed app url/
    );
  });

  test("should throw when response has no url", async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = getUrlString(input);
      if (urlStr.includes("/signedAppUrl")) {
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("Not found", { status: 404 });
    };

    await assert.rejects(() => getCounselSignedAppUrl(makeSession()), /expected string|Invalid/);
  });
});

describe("getChatSignedAppUrlCacheKey", () => {
  test("should return cache key with counsel user id", () => {
    const key = getChatSignedAppUrlCacheKey("user-123");
    assert.strictEqual(key, "chat-signed-app-url-user-123");
  });
});
