import { Elysia } from "elysia";
import { v4 as uuidv4 } from "uuid";

/**
 * Elysia plugin that logs all incoming requests and their responses.
 * Replaces the Express res.on("finish") pattern with Elysia lifecycle hooks.
 */
export const observabilityPlugin = new Elysia({ name: "observability" })
  .derive({ as: "global" }, () => ({
    requestId: uuidv4(),
    requestStart: performance.now(),
  }))
  .onBeforeHandle({ as: "global" }, ({ request, requestId, body }) => {
    const path = new URL(request.url).pathname;
    console.info(`Incoming request - ${requestId}`, {
      method: request.method,
      path,
      body,
    });
  })
  .onAfterHandle({ as: "global" }, ({ request, set, requestId, requestStart }) => {
    const path = new URL(request.url).pathname;
    console.info(`Request finished - ${requestId}`, {
      method: request.method,
      path,
      statusCode: set.status,
      duration: `${(performance.now() - requestStart).toFixed(2)}ms`,
    });
  });
