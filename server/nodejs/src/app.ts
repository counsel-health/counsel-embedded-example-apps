import { HttpError, UserFacingError, isHttpError } from "@/lib/http";
import { observabilityPlugin } from "@/lib/observability";
import { MainPlugin } from "@/routes";
import { cors } from "@elysiajs/cors";
import { Elysia, ValidationError } from "elysia";

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
    }),
  )
  .onAfterHandle({ as: "global" }, ({ set }) => {
    applySecurityHeaders(set);
  })
  .use(observabilityPlugin)
  .use(MainPlugin)
  .onError({ as: "global" }, (ctx) => {
    const { error, set, code, request } = ctx;
    // onAfterHandle does not run for errors; mirror Express helmet on all responses.
    applySecurityHeaders(set);

    const method = request?.method ?? "UNKNOWN";
    const path = request ? new URL(request.url).pathname : "unknown";
    // requestId/requestStart are injected by the global observability derive.
    // Cast to any because onError's inferred context type omits derived fields.
    const { requestId, requestStart } = ctx as unknown as {
      requestId: string;
      requestStart: number;
    };

    const logCompletion = (statusCode: number) => {
      const duration = requestStart ? `${(performance.now() - requestStart).toFixed(2)}ms` : "unknown";
      console.info(`Request finished - ${requestId ?? "no-id"}`, {
        method,
        path,
        statusCode,
        duration,
      });
    };

    if (code === "VALIDATION") {
      const isResponseFailure =
        error instanceof ValidationError && error.type === "response";

      if (!(error instanceof ValidationError) || isResponseFailure) {
        set.status = 500;
        console.error(
          `Response or unknown validation failure on ${method} ${path} (${requestId ?? "no-id"})`,
          error instanceof Error ? error.message : error,
        );
        logCompletion(500);
        return { errors: { message: "Internal Server Error" } };
      }

      const clientMessage =
        error.type === "body" ? "Invalid request body" : "Invalid request";
      console.warn(`Validation error (${error.type}) on ${method} ${path}`, error.message);
      set.status = 422;
      logCompletion(422);
      return { errors: { message: clientMessage } };
    }

    const err = error instanceof Error ? error : new Error(String(error));

    // UserFacingError: route-level business/validation error → { error: "..." }
    // This preserves the client contract that auth and input errors use a flat shape.
    if (err instanceof UserFacingError) {
      set.status = err.status;
      console.warn(`UserFacingError ${err.status} on ${method} ${path}: ${err.message}`);
      logCompletion(err.status);
      return { error: err.message };
    }

    const httpStatus = isHttpError(err) ? err.status : 500;
    set.status = httpStatus;

    if (httpStatus >= 500) {
      console.error(`Error ${httpStatus} on ${method} ${path}`, err);
    } else {
      // 4xx from HttpError (e.g. 404 catch-all) — not a server fault
      console.warn(`Error ${httpStatus} on ${method} ${path}: ${err.message}`);
    }

    logCompletion(httpStatus);
    return { errors: { message: err.message, error: err } };
  })
  // 404 catch-all — must come after all routes
  .all("*", () => {
    throw new HttpError("Not Found", 404);
  });

export default app;
