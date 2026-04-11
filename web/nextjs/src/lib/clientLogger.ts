import pino from "pino";

// Browser-compatible pino logger for use in "use client" components.
// Does NOT import pino-pretty (Node.js only); pino delegates to console.* in the browser.
export const clientLogger = pino({
  browser: { asObject: false },
  level: process.env.NODE_ENV !== "production" ? "debug" : "info",
});
