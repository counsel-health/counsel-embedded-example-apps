import { z } from "zod";

// Access code configuration schema
export const AccessCodeConfigSchema = z.object({
  client: z.string(),
  apiKey: z.string(),
  apiUrl: z.string().url(),
  userType: z.enum(["main", "onboarding"]).default("main"),
});

// Environment configuration schema
export const envConfig = z.object({
  PORT: z.coerce.number().default(4003),
  JWT_SECRET: z.string().min(32),
  COUNSEL_WEBHOOK_SECRET: z.string(),
  // JSON string mapping access codes to client/environment/API key configs
  // Format: {"ACCESS_CODE_CONFIGS": {"client": "main", "apiUrl": "https://test-api.counselhealth.com", "apiKey": "key123"}, ...}
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
