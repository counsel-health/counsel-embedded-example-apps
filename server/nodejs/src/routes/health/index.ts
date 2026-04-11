import { Elysia } from "elysia";
import { z } from "zod";

/**
 * @description Check the server is running
 * @route GET /health
 */
export const HealthPlugin = new Elysia().get(
  "/health",
  () => ({ message: "ok" }),
  { response: z.object({ message: z.string() }) }
);
