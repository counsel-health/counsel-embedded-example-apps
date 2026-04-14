/**
 * Mock access code configurations for testing
 * Simulates the structure of ACCESS_CODE_CONFIGS from envConfig
 */
export const mockAccessCodeConfigs = {
  MAIN01: {
    client: "main",
    apiUrl: "https://test-api.counselhealth.com",
    userType: "main" as const,
    apiKey: "sk_test_main01_key",
    issuer: "https://local-test-partner.example.com/main",
  },
  APIK01: {
    client: "main",
    apiUrl: "https://test-api.counselhealth.com",
    userType: "main" as const,
    apiKey: "sk_test_api_key_123",
  },
  ONBR01: {
    client: "onboarding",
    apiUrl: "https://test-api.counselhealth.com",
    userType: "onboarding" as const,
    apiKey: "sk_test_onbr01_key",
    issuer: "https://local-test-partner.example.com/onboarding",
  },
  CLNT02: {
    client: "client2",
    apiUrl: "https://test-api.counselhealth.com",
    userType: "main" as const,
    apiKey: "sk_test_clnt02_key",
    issuer: "https://local-test-partner.example.com/client2",
  },
  MAIN02: {
    client: "main",
    apiUrl: "https://test-api.counselhealth.com",
    userType: "main" as const,
    apiKey: "sk_test_main02_key",
    issuer: "https://local-test-partner.example.com/main",
  },
  ONBR02: {
    client: "onboarding",
    apiUrl: "https://local-api.counselhealth.com",
    userType: "onboarding" as const,
    apiKey: "sk_test_onbr02_key",
    issuer: "https://local-test-partner.example.com/onboarding",
  },
  CLNT01: {
    client: "client1",
    apiUrl: "https://local.counselhealth.com",
    userType: "onboarding" as const,
    apiKey: "sk_test_clnt01_key",
    issuer: "https://local-test-partner.example.com/client1",
  },
} as const;
