import { z } from "zod";

export const ServerEnvSchema = z.object({
  IRON_SESSION_PASSWORD: z.string(),
  // The server HOST, defaults to localhost:4003 if not set
  SERVER_HOST: z.string().default("http://localhost:4003"),
});

export const serverEnv = ServerEnvSchema.parse(process.env);
