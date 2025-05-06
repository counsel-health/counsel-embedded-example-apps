import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const envConfig = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val))
    .default("4003"),
  COUNSEL_API_KEY: z.string(),
  COUNSEL_API_HOST: z.string().optional(),
});

export const env = envConfig.parse(process.env);

export function loadEnvConfig() {
  return envConfig.parse(process.env);
}
