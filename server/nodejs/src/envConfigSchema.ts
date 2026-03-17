import { z } from "zod";

// Access code configuration schema
export const AccessCodeConfigSchema = z.object({
  client: z.string(),
  apiUrl: z.string().url(),
  userType: z.enum(["main", "onboarding"]).default("main"),
  // The iss claim put in JWTs for this access code's org.
  // Counsel maps this to the org in orgByIssuer.
  issuer: z.string().url(),
});

// Environment configuration schema
export const envConfig = z.object({
  PORT: z.coerce.number().default(4003),
  JWT_SECRET: z.string().min(32),
  COUNSEL_WEBHOOK_SECRET: z.string(),
  // RSA private key PEM for signing JWTs sent to Counsel
  COUNSEL_PRIVATE_KEY_PEM: z.string(),
  // JSON string mapping access codes to client/environment configs
  // Format: {"ACCESS_CODE_CONFIGS": {"MAIN01": {"client": "main", "apiUrl": "https://test-api.counselhealth.com", "userType": "main"}, ...}}
  ACCESS_CODE_CONFIGS: z
    .string()
    .transform((val) => {
      try {
        return JSON.parse(val);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`ACCESS_CODE_CONFIGS must be valid JSON: ${errorMessage}`);
      }
    })
    .pipe(
      z
        .record(z.string().length(6), AccessCodeConfigSchema)
        .refine((configs) => Object.keys(configs).length > 0, {
          message: "At least one access code configuration is required",
        })
    ),
});
