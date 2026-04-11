import { Elysia } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { httpLogger } from "@/lib/logger";

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
    httpLogger.info({ method: request.method, path, body, requestId }, "Incoming request");
  })
  .onAfterHandle({ as: "global" }, ({ request, set, requestId, requestStart }) => {
    const path = new URL(request.url).pathname;
    httpLogger.info(
      {
        method: request.method,
        path,
        statusCode: set.status,
        duration: `${(performance.now() - requestStart).toFixed(2)}ms`,
        requestId,
      },
      "Request finished",
    );
  });
