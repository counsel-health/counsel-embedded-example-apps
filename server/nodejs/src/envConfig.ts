import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

const envConfig = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val))
    .default("4003"),
  COUNSEL_API_KEY: z.string(),
  COUNSEL_API_HOST: z.string().default("https://sandbox-api.counselhealth.com"),
  SERVER_BEARER_TOKEN: z.string().min(32),
  ACCESS_CODE: z.string().length(6),
  JWT_SECRET: z.string().min(32),
});

export const env = envConfig.parse(process.env);

export function loadEnvConfig() {
  return envConfig.parse(process.env);
}
