import type { IronSession } from "iron-session";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { getChatSignedAppUrlCacheKey, getCounselSignedAppUrl } from "../server";
import type { SessionData } from "../session";

const originalFetch = globalThis.fetch;

function getUrlString(input: RequestInfo | URL): string {
  return typeof input === "string"
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;
}

function makeSession(
  overrides: Partial<SessionData> = {}
): IronSession<SessionData> {
  const session: SessionData = {
    token: "session-token",
    userType: "main",
    counselUserId: "counsel-user-456",
    authType: "apiKey",
    navMode: "standalone",
    counselApiUrl: "https://test-api.example.com",
    ...overrides,
  };
  return {
    ...session,
    save: async () => {},
    destroy: async () => {},
    updateConfig: () => {},
  } as IronSession<SessionData>;
}

describe("getCounselSignedAppUrl", () => {
  beforeEach(() => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = getUrlString(input);
      if (urlStr.includes("/token")) {
        return new Response(
          JSON.stringify({ token: "counsel-jwt-from-server" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      if (urlStr.includes("/signedAppUrl")) {
        return new Response(
          JSON.stringify({ url: "https://embed.counsel.test/signed" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      return new Response("Not found", { status: 404 });
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("apiKey flow: should return signed app url via demo server", async () => {
    const url = await getCounselSignedAppUrl(
      makeSession({ authType: "apiKey" })
    );
    expect(url).toBe("https://embed.counsel.test/signed");
  });

  test("jwt authType: signed app url still goes via demo server", async () => {
    const url = await getCounselSignedAppUrl(makeSession({ authType: "jwt" }));
    expect(url).toBe("https://embed.counsel.test/signed");
  });

  test("should throw when server returns error", async () => {
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = getUrlString(input);
      if (urlStr.includes("/signedAppUrl")) {
        return new Response("Unauthorized", { status: 401 });
      }
      return new Response("Not found", { status: 404 });
    };

    await expect(getCounselSignedAppUrl(makeSession())).rejects.toThrow(
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

    await expect(getCounselSignedAppUrl(makeSession())).rejects.toThrow(
      /expected string|Invalid/
    );
  });
});

describe("getChatSignedAppUrlCacheKey", () => {
  test("should return cache key with counsel user id", () => {
    const key = getChatSignedAppUrlCacheKey("user-123");
    expect(key).toBe("chat-signed-app-url-user-123");
  });
});
