import { z } from "zod";
import dotenv from "dotenv";
import { envConfig, AccessCodeConfigSchema } from "@/envConfigSchema";

dotenv.config({ path: [".env.local", ".env"] });

export const env = envConfig.parse(process.env);

export function loadEnvConfig() {
  return envConfig.parse(process.env);
}

// Helper to get access code config
export function getAccessCodeConfig(accessCode: string): z.infer<typeof AccessCodeConfigSchema> | null {
  const normalizedAccessCode = accessCode.trim().toUpperCase();
  const config = env.ACCESS_CODE_CONFIGS[normalizedAccessCode];
  return config || null;
}
