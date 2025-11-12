import { test, describe } from "node:test";
import assert from "node:assert";
import { z } from "zod";
import { envConfig } from "@/envConfigSchema";
import { setupTestEnv } from "@/lib/__mocks__/envConfig";

// Set up test environment before importing @/envConfig
setupTestEnv();


describe("envConfig", () => {
  describe("ACCESS_CODE_CONFIGS parsing", () => {
    test("should parse valid ACCESS_CODE_CONFIGS JSON", () => {
      const validConfig = JSON.stringify({
        MAIN01: {
          client: "main",
          apiUrl: "https://test-api.counselhealth.com",
          apiKey: "sk_test_123",
          userType: "main",
        },
        ONBR01: {
          client: "onboarding",
          apiUrl: "https://test-api.counselhealth.com",
          apiKey: "sk_test_456",
          userType: "onboarding",
        },
      });

      const result = envConfig.shape.ACCESS_CODE_CONFIGS.parse(validConfig);

      assert.strictEqual(result.MAIN01.client, "main");
      assert.strictEqual(result.MAIN01.apiUrl, "https://test-api.counselhealth.com");
      assert.strictEqual(result.MAIN01.apiKey, "sk_test_123");
      assert.strictEqual(result.ONBR01.client, "onboarding");
      assert.strictEqual(result.ONBR01.apiUrl, "https://test-api.counselhealth.com");
      assert.strictEqual(result.ONBR01.apiKey, "sk_test_456");
      assert.strictEqual(result.MAIN01.userType, "main");
      assert.strictEqual(result.ONBR01.userType, "onboarding");
    });

    test("should default userType to 'main' if not provided", () => {
      const configWithoutUserType = JSON.stringify({
        MAIN01: {
          client: "main",
          apiUrl: "https://test-api.counselhealth.com",
          apiKey: "sk_test_123",
          // userType not provided, should default to "main"
        },
      });

      const result = envConfig.shape.ACCESS_CODE_CONFIGS.parse(configWithoutUserType);

      assert.strictEqual(result.MAIN01.client, "main");
      assert.strictEqual(result.MAIN01.apiUrl, "https://test-api.counselhealth.com");
      assert.strictEqual(result.MAIN01.apiKey, "sk_test_123");
      assert.strictEqual(result.MAIN01.userType, "main");
    });

    test("should reject invalid JSON", () => {
      const invalidJson = '{"invalid": json}';

      assert.throws(
        () => envConfig.shape.ACCESS_CODE_CONFIGS.parse(invalidJson),
        (error: Error) => {
          return error.message.includes("ACCESS_CODE_CONFIGS must be valid JSON");
        }
      );
    });

    test("should reject empty ACCESS_CODE_CONFIGS", () => {
      const emptyConfig = JSON.stringify({});

      assert.throws(
        () => envConfig.shape.ACCESS_CODE_CONFIGS.parse(emptyConfig),
        (error: z.ZodError) => {
          return error.issues.some(
            (issue) => issue.message === "At least one access code configuration is required"
          );
        }
      );
    });


    test("should accept multiple clients with same apiUrl", () => {
      const validConfig = JSON.stringify({
        MAIN01: {
          client: "main",
          apiUrl: "https://test-api.counselhealth.com",
          apiKey: "sk_main_123",
          userType: "main",
        },
        CLNT01: {
          client: "client1",
          apiUrl: "https://test-api.counselhealth.com",
          apiKey: "sk_client1_123",
          userType: "main",
        },
        CLNT02: {
          client: "client2",
          apiUrl: "https://test-api.counselhealth.com",
          apiKey: "sk_client2_123",
          userType: "onboarding",
        },
      });

      const result = envConfig.shape.ACCESS_CODE_CONFIGS.parse(validConfig);

      assert.strictEqual(result.MAIN01.client, "main");
      assert.strictEqual(result.MAIN01.apiUrl, "https://test-api.counselhealth.com");
      assert.strictEqual(result.MAIN01.apiKey, "sk_main_123");
      assert.strictEqual(result.CLNT02.client, "client2");
      assert.strictEqual(result.CLNT02.apiUrl, "https://test-api.counselhealth.com");
      assert.strictEqual(result.CLNT02.apiKey, "sk_client2_123");
      assert.strictEqual(result.CLNT01.client, "client1");
      assert.strictEqual(result.CLNT01.apiUrl, "https://test-api.counselhealth.com");
      assert.strictEqual(result.CLNT01.apiKey, "sk_client1_123");
      assert.strictEqual(Object.keys(result).length, 3);
      assert.strictEqual(result.MAIN01.userType, "main");
      assert.strictEqual(result.CLNT01.userType, "main");
      assert.strictEqual(result.CLNT02.userType, "onboarding");
    });
  });


  describe("getAccessCodeConfig helper function logic", () => {
    test("should return config for existing access code", () => {
      const mockConfigs = {
        MAIN01: {
          client: "main",
          apiUrl: "https://test-api.counselhealth.com",
          apiKey: "sk_test_123",
          userType: "main",
        },
        ONBR01: {
          client: "onboarding",
          apiUrl: "https://test-api.counselhealth.com",
          apiKey: "sk_test_456",
          userType: "onboarding",
        },
      };

      const accessCode = "MAIN01";
      const config = mockConfigs[accessCode as keyof typeof mockConfigs];

      assert.ok(config);
      assert.strictEqual(config.client, "main");
      assert.strictEqual(config.apiUrl, "https://test-api.counselhealth.com");
      assert.strictEqual(config.apiKey, "sk_test_123");
      assert.strictEqual(config.userType, "main");
    });

    test("should normalize lowercase access code to uppercase", async () => {
      const { getAccessCodeConfig } = await import("@/envConfig");
      const config = getAccessCodeConfig("main01");

      assert.ok(config);
      assert.strictEqual(config.client, "main");
      assert.strictEqual(config.apiUrl, "https://test-api.counselhealth.com");
      assert.strictEqual(config.apiKey, "sk_test_123");
      assert.strictEqual(config.userType, "main");
    });

  
    test("should return null for non-existent access code", async () => {
      const { getAccessCodeConfig } = await import("@/envConfig");
      const config = getAccessCodeConfig("INVALID");

      assert.strictEqual(config, null);
    });

    test("should return null for non-existent access code (even after normalization)", async () => {
      const { getAccessCodeConfig } = await import("@/envConfig");
      const config = getAccessCodeConfig("  invalid  ");

      assert.strictEqual(config, null);
    });
  });
});

