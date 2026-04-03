import { z } from "zod";

// Access code configuration schema
// Supports two auth modes:
// - apiKey: API key auth (Bearer apiKey). Use when you have a Counsel API key.
// - issuer: JWT auth only. Use with COUNSEL_PRIVATE_KEY_PEM for RSA-signed JWTs.
// At least one of apiKey or issuer must be present.
export const AccessCodeConfigSchema = z
  .object({
    client: z.string(),
    apiUrl: z.string().url(),
    userType: z.enum(["main", "onboarding"]).default("main"),
    // API key for API key auth. When present, used as Bearer token.
    apiKey: z.string().optional(),
    // The iss claim put in JWTs for this access code's org.
    // Required when apiKey is not present. Counsel maps this to the org in orgByIssuer.
    issuer: z.string().url().optional(),
  })
  .refine((config) => config.apiKey ?? config.issuer, {
    message: "Each access code config must have either apiKey or issuer",
  });

// Environment configuration schema
export const envConfig = z
  .object({
    PORT: z.coerce.number().default(4003),
    JWT_SECRET: z.string().min(32),
    COUNSEL_WEBHOOK_SECRET: z.string(),
    // RSA private key PEM for signing JWTs. Required when any access code uses issuer-based auth.
    COUNSEL_PRIVATE_KEY_PEM: z.string().optional(),
    // JSON string mapping access codes to client/environment configs
    // Format: {"ACCESS_CODE_CONFIGS": {"MAIN01": {"client": "main", "apiUrl": "https://test-api.counselhealth.com", "userType": "main"}, ...}}
    ACCESS_CODE_CONFIGS: z
      .string()
      .transform((val) => {
        try {
          return JSON.parse(val);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          throw new Error(
            `ACCESS_CODE_CONFIGS must be valid JSON: ${errorMessage}`
          );
        }
      })
      .pipe(
        z
          .record(z.string().length(6), AccessCodeConfigSchema)
          .refine((configs) => Object.keys(configs).length > 0, {
            message: "At least one access code configuration is required",
          })
      ),
  })
  .superRefine((data, ctx) => {
    const hasIssuerConfig = Object.values(data.ACCESS_CODE_CONFIGS).some(
      (c) => c.issuer
    );
    if (hasIssuerConfig && !data.COUNSEL_PRIVATE_KEY_PEM) {
      ctx.addIssue({
        code: "custom",
        message:
          "COUNSEL_PRIVATE_KEY_PEM is required when any access code uses issuer-based JWT auth",
        path: ["COUNSEL_PRIVATE_KEY_PEM"],
      });
    }
  });
