import { Elysia } from "elysia";

/**
 * @description Check the server is running
 * @route GET /health
 */
export const HealthPlugin = new Elysia().get("/health", () => ({
  message: "ok",
}));
