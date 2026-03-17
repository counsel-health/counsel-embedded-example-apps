import "./test-setup";
import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { getCounselSignedAppUrl, getChatSignedAppUrlCacheKey } from "./server";

const originalFetch = globalThis.fetch;

function getUrlString(input: RequestInfo | URL): string {
  return typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
}

describe("getCounselSignedAppUrl", () => {
  beforeEach(() => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = getUrlString(input);
      if (urlStr.includes("/token")) {
        return new Response(JSON.stringify({ token: "counsel-jwt-123" }), {
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

  test("should return signed app url when both requests succeed", async () => {
    const url = await getCounselSignedAppUrl("session-token", "counsel-user-456");
    assert.strictEqual(url, "https://embed.counsel.test/signed");
  });

  test("should throw when token endpoint fails", async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = getUrlString(input);
      if (urlStr.includes("/token")) {
        return new Response("Unauthorized", { status: 401 });
      }
      return new Response("Not found", { status: 404 });
    };

    await assert.rejects(
      () => getCounselSignedAppUrl("bad-token", "counsel-user-456"),
      /Failed to get Counsel token/
    );
  });

  test("should throw when token response has no token", async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = getUrlString(input);
      if (urlStr.includes("/token")) {
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("Not found", { status: 404 });
    };

    await assert.rejects(
      () => getCounselSignedAppUrl("session-token", "counsel-user-456"),
      /Invalid token response/
    );
  });

  test("should throw when signedAppUrl endpoint fails", async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = getUrlString(input);
      if (urlStr.includes("/token")) {
        return new Response(JSON.stringify({ token: "counsel-jwt-123" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (urlStr.includes("/signedAppUrl")) {
        return new Response("Forbidden", { status: 403 });
      }
      return new Response("Not found", { status: 404 });
    };

    await assert.rejects(
      () => getCounselSignedAppUrl("session-token", "counsel-user-456"),
      /Failed to get signed app url/
    );
  });

  test("should throw when signedAppUrl response has no url", async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = getUrlString(input);
      if (urlStr.includes("/token")) {
        return new Response(JSON.stringify({ token: "counsel-jwt-123" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (urlStr.includes("/signedAppUrl")) {
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("Not found", { status: 404 });
    };

    await assert.rejects(
      () => getCounselSignedAppUrl("session-token", "counsel-user-456"),
      /Invalid signed app url response/
    );
  });
});

describe("getChatSignedAppUrlCacheKey", () => {
  test("should return cache key with counsel user id", () => {
    const key = getChatSignedAppUrlCacheKey("user-123");
    assert.strictEqual(key, "chat-signed-app-url-user-123");
  });
});
