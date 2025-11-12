import { test, describe } from "node:test";
import assert from "node:assert";
import { mockAccessCodeConfigs } from "./__mocks__/accessCodeConfigs";

describe("access code config lookup", () => {
  describe("get access code config logic", () => {
    test("should find config when access code exists", () => {
      const accessCode = "MAIN01";
      const config = mockAccessCodeConfigs[accessCode];

      assert.ok(config);
      assert.strictEqual(config.apiKey, "sk_dev_main_key");
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
      assert.notStrictEqual(mainDev.apiKey, onboardingLocal.apiKey);
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
      assert.notStrictEqual(mainDev.apiKey, onboardingDev.apiKey);
      assert.notStrictEqual(mainDev.apiKey, mainProd.apiKey);
    });
  });
});
