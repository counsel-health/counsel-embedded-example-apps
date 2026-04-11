import { Elysia } from "elysia";

/**
 * @description Returns a welcome message
 * @route GET /
 */
export const RootPlugin = new Elysia().get("/", () => ({
  message: "Welcome to the Example Counsel Node.js server!",
}));
