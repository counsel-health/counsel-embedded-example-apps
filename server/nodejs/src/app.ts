import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { MainPlugin } from "@/routes";
import { observabilityPlugin } from "@/lib/observability";
import { HttpError, isHttpError } from "@/lib/http";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "no-referrer",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

function applySecurityHeaders(set: { headers: Record<string, unknown> }) {
  Object.assign(set.headers, SECURITY_HEADERS);
}

const app = new Elysia()
  .use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .onAfterHandle({ as: "global" }, ({ set }) => {
    applySecurityHeaders(set);
  })
  .use(observabilityPlugin)
  .use(MainPlugin)
  .onError(({ error, set, code, request }) => {
    // onAfterHandle does not run for errors; mirror Express helmet on all responses.
    applySecurityHeaders(set);

    const method = request?.method ?? "UNKNOWN";
    const path = request ? new URL(request.url).pathname : "unknown";

    if (code === "VALIDATION") {
      // Elysia body/param/query schema validation failure — 422 by convention.
      // Log at warn level: these are client errors, not server faults.
      console.warn(`Validation error on ${method} ${path}`, error.message);
      set.status = 422;
      return { errors: { message: "Invalid request body" } };
    }

    const err = error instanceof Error ? error : new Error(String(error));
    const status = isHttpError(err) ? err.status : 500;
    set.status = status;

    if (status >= 500) {
      console.error(`Error ${status} on ${method} ${path}`, err);
    } else {
      // 4xx from HttpError (e.g. 404 catch-all) — not a server fault
      console.warn(`Error ${status} on ${method} ${path}: ${err.message}`);
    }

    return { errors: { message: err.message, error: err } };
  })
  // 404 catch-all — must come after all routes
  .all("*", () => {
    throw new HttpError("Not Found", 404);
  });

export default app;
