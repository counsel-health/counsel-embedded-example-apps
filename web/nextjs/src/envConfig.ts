import { z } from "zod";

export const ServerEnvSchema = z.object({
  IRON_SESSION_PASSWORD: z.string(),
  // The access code is used to access the app.
  ACCESS_CODE: z.string().length(6),
  // The server HOST, defaults to localhost:4003 if not set
  SERVER_HOST: z.string().default("http://localhost:4003"),
});

export const serverEnv = ServerEnvSchema.parse(process.env);
