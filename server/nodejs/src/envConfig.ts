import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

const envConfig = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val))
    .default("4003"),
  ACCESS_CODE: z.string().length(6),
  COUNSEL_API_KEY: z.string(),
  COUNSEL_API_HOST: z.string().default("https://sandbox-api.counselhealth.com"),
  JWT_SECRET: z.string().min(32),
  COUNSEL_WEBHOOK_SECRET: z.string(),
  // This is the access code for the onboarding process which is a different flow from the main access code
  ACCESS_CODE_COUNSEL_ONBOARDING: z.string().length(6),
  // This is the API key for the onboarding process which is a different flow & therefore a different API key
  COUNSEL_ONBOARDING_API_KEY: z.string(),
});

export const env = envConfig.parse(process.env);

export function loadEnvConfig() {
  return envConfig.parse(process.env);
}
