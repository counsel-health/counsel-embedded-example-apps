/**
 * Mock access code configurations for testing
 * Simulates the structure of ACCESS_CODE_CONFIGS from envConfig
 */
export const mockAccessCodeConfigs = {
  MAIN01: {
    client: "main",
    apiUrl: "https://test-api.counselhealth.com",
    apiKey: "sk_dev_main_key",
    userType: "main" as const,
  },
  ONBR01: {
    client: "onboarding",
    apiUrl: "https://test-api.counselhealth.com",
    apiKey: "sk_dev_onboarding_key",
    userType: "onboarding" as const,
  },
  CLNT02: {
    client: "client2",
    apiUrl: "https://test-api.counselhealth.com",
    apiKey: "sk_sandbox_client2_key",
    userType: "main" as const,
  },
  MAIN02: {
    client: "main",
    apiUrl: "https://test-api.counselhealth.com",
    apiKey: "sk_prod_main_key",
    userType: "main" as const,
  },
  ONBR02: {
    client: "onboarding",
    apiUrl: "https://local-api.counselhealth.com",
    apiKey: "sk_sandbox_onboarding_key",
    userType: "onboarding" as const,
  },
  CLNT01: {
    client: "client1",
    apiUrl: "https://local.counselhealth.com",
    apiKey: "sk_prod_client1_key",
    userType: "onboarding" as const,
  },
} as const;

