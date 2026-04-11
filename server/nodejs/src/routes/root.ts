import { Elysia } from "elysia";
import { z } from "zod";

/**
 * @description Returns a welcome message
 * @route GET /
 */
export const RootPlugin = new Elysia().get(
  "/",
  () => ({ message: "Welcome to the Example Counsel Node.js server!" }),
  { response: z.object({ message: z.string() }) }
);
