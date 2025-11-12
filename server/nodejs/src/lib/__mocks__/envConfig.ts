/**
 * Mock environment configuration for testing
 * Sets up test environment variables before envConfig.ts is imported
 */

export function setupTestEnv() {
  if (!process.env.ACCESS_CODE_CONFIGS) {
    process.env.PORT = "4003";
    process.env.JWT_SECRET = "a".repeat(32);
    process.env.COUNSEL_WEBHOOK_SECRET = "test-webhook-secret";
    process.env.ACCESS_CODE_CONFIGS = JSON.stringify({
      MAIN01: {
        client: "main",
        apiUrl: "https://test-api.counselhealth.com",
        apiKey: "sk_test_123",
        userType: "main",
      },
      CODE23: {
        client: "main",
        apiUrl: "https://test-api.counselhealth.com",
        apiKey: "sk_test_789",
        userType: "main",
      },
      ONBR01: {
        client: "onboarding",
        apiUrl: "https://test-api.counselhealth.com",
        apiKey: "sk_test_456",
        userType: "onboarding",
      },
    });
  }
}

