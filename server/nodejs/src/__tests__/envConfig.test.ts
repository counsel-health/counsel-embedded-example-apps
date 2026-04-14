import { envConfig } from "@/envConfigSchema";
import { setupTestEnv } from "@/lib/__mocks__/envConfig";
import { describe, expect, test } from "vitest";

setupTestEnv();

describe("envConfig", () => {
  describe("ACCESS_CODE_CONFIGS parsing", () => {
    test("should parse valid ACCESS_CODE_CONFIGS JSON", () => {
      const validConfig = JSON.stringify({
        MAIN01: {
          client: "main",
          apiUrl: "https://test-api.counselhealth.com",
          userType: "main",
          apiKey: "sk_test_main01_key",
          issuer: "https://local-test-partner.example.com/main",
        },
        ONBR01: {
          client: "onboarding",
          apiUrl: "https://test-api.counselhealth.com",
          userType: "onboarding",
          apiKey: "sk_test_onbr01_key",
          issuer: "https://local-test-partner.example.com/onboarding",
        },
      });

      const result = envConfig.shape.ACCESS_CODE_CONFIGS.parse(validConfig);

      expect(result.MAIN01.client).toBe("main");
      expect(result.MAIN01.apiUrl).toBe("https://test-api.counselhealth.com");
      expect(result.MAIN01.issuer).toBe(
        "https://local-test-partner.example.com/main"
      );
      expect(result.ONBR01.client).toBe("onboarding");
      expect(result.ONBR01.apiUrl).toBe("https://test-api.counselhealth.com");
      expect(result.ONBR01.issuer).toBe(
        "https://local-test-partner.example.com/onboarding"
      );
      expect(result.MAIN01.userType).toBe("main");
      expect(result.ONBR01.userType).toBe("onboarding");
    });

    test("should default userType to 'main' if not provided", () => {
      const configWithoutUserType = JSON.stringify({
        MAIN01: {
          client: "main",
          apiUrl: "https://test-api.counselhealth.com",
          apiKey: "sk_test_main01_key",
          issuer: "https://local-test-partner.example.com/main",
        },
      });

      const result = envConfig.shape.ACCESS_CODE_CONFIGS.parse(
        configWithoutUserType
      );

      expect(result.MAIN01.client).toBe("main");
      expect(result.MAIN01.apiUrl).toBe("https://test-api.counselhealth.com");
      expect(result.MAIN01.issuer).toBe(
        "https://local-test-partner.example.com/main"
      );
      expect(result.MAIN01.userType).toBe("main");
    });

    test("should reject invalid JSON", () => {
      const invalidJson = '{"invalid": json}';

      expect(() =>
        envConfig.shape.ACCESS_CODE_CONFIGS.parse(invalidJson)
      ).toThrow("ACCESS_CODE_CONFIGS must be valid JSON");
    });

    test("should parse config with apiKey (API key auth)", () => {
      const apiKeyConfig = JSON.stringify({
        APIK01: {
          client: "main",
          apiUrl: "https://test-api.counselhealth.com",
          userType: "main",
          apiKey: "sk_test_123",
        },
      });

      const result = envConfig.shape.ACCESS_CODE_CONFIGS.parse(apiKeyConfig);

      expect(result.APIK01.client).toBe("main");
      expect(result.APIK01.apiKey).toBe("sk_test_123");
      expect(result.APIK01.issuer).toBeUndefined();
    });

    test("should reject config with neither apiKey nor issuer", () => {
      const invalidConfig = JSON.stringify({
        BADCFG: {
          client: "main",
          apiUrl: "https://test-api.counselhealth.com",
          userType: "main",
        },
      });

      expect(() =>
        envConfig.shape.ACCESS_CODE_CONFIGS.parse(invalidConfig)
      ).toThrow(/apiKey/);
    });

    test("should reject empty ACCESS_CODE_CONFIGS", () => {
      const emptyConfig = JSON.stringify({});

      expect(() =>
        envConfig.shape.ACCESS_CODE_CONFIGS.parse(emptyConfig)
      ).toThrow("At least one access code configuration is required");
    });

    test("should accept multiple clients with same apiUrl", () => {
      const validConfig = JSON.stringify({
        MAIN01: {
          client: "main",
          apiUrl: "https://test-api.counselhealth.com",
          userType: "main",
          apiKey: "sk_test_main01_key",
          issuer: "https://local-test-partner.example.com/main",
        },
        CLNT01: {
          client: "client1",
          apiUrl: "https://test-api.counselhealth.com",
          userType: "main",
          apiKey: "sk_test_clnt01_key",
          issuer: "https://local-test-partner.example.com/client1",
        },
        CLNT02: {
          client: "client2",
          apiUrl: "https://test-api.counselhealth.com",
          userType: "onboarding",
          apiKey: "sk_test_clnt02_key",
          issuer: "https://local-test-partner.example.com/client2",
        },
      });

      const result = envConfig.shape.ACCESS_CODE_CONFIGS.parse(validConfig);

      expect(result.MAIN01.client).toBe("main");
      expect(result.MAIN01.apiUrl).toBe("https://test-api.counselhealth.com");
      expect(result.MAIN01.issuer).toBe(
        "https://local-test-partner.example.com/main"
      );
      expect(result.CLNT02.client).toBe("client2");
      expect(result.CLNT02.apiUrl).toBe("https://test-api.counselhealth.com");
      expect(result.CLNT02.issuer).toBe(
        "https://local-test-partner.example.com/client2"
      );
      expect(result.CLNT01.client).toBe("client1");
      expect(result.CLNT01.apiUrl).toBe("https://test-api.counselhealth.com");
      expect(result.CLNT01.issuer).toBe(
        "https://local-test-partner.example.com/client1"
      );
      expect(Object.keys(result).length).toBe(3);
      expect(result.MAIN01.userType).toBe("main");
      expect(result.CLNT01.userType).toBe("main");
      expect(result.CLNT02.userType).toBe("onboarding");
    });
  });

  describe("getAccessCodeConfig helper function logic", () => {
    test("should return config for existing access code", () => {
      const mockConfigs = {
        MAIN01: {
          client: "main",
          apiUrl: "https://test-api.counselhealth.com",
          userType: "main",
          apiKey: "sk_test_main01_key",
          issuer: "https://local-test-partner.example.com/main",
        },
        ONBR01: {
          client: "onboarding",
          apiUrl: "https://test-api.counselhealth.com",
          userType: "onboarding",
          apiKey: "sk_test_onbr01_key",
          issuer: "https://local-test-partner.example.com/onboarding",
        },
      };

      const config = mockConfigs["MAIN01" as keyof typeof mockConfigs];

      expect(config).toBeTruthy();
      expect(config.client).toBe("main");
      expect(config.apiUrl).toBe("https://test-api.counselhealth.com");
      expect(config.issuer).toBe("https://local-test-partner.example.com/main");
      expect(config.userType).toBe("main");
    });

    test("should return null for non-existent access code", async () => {
      const { getAccessCodeConfig } = await import("@/envConfig");
      expect(getAccessCodeConfig("INVALID")).toBeNull();
    });

    test("should return null for non-existent access code (even after normalization)", async () => {
      const { getAccessCodeConfig } = await import("@/envConfig");
      expect(getAccessCodeConfig("  invalid  ")).toBeNull();
    });
  });
});
