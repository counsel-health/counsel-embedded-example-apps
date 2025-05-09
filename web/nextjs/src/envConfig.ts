import { z } from "zod";

export const ServerEnvSchema = z.object({
  IRON_SESSION_PASSWORD: z.string(),
  // The access code is used to access the app.
  ACCESS_CODE: z.string().length(6),
});

export const serverEnv = ServerEnvSchema.parse(process.env);
