import pino from "pino";
import pretty from "pino-pretty";

// Pretty-print logs only when running in an interactive terminal (local dev).
// Deployed environments (Cloud Run) are not a TTY and get structured JSON on stdout.
const prettyStream = process.stdout.isTTY
  ? pretty({
      colorize: true,
      levelFirst: true,
      ignore: "pid,hostname",
      translateTime: "SYS:standard",
    })
  : undefined;

export const logger = pino(
  {
    name: "server",
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    // Keep access codes and bearer tokens out of the logs. These show up in request
    // bodies (signUp) and headers (signedAppUrl); pino redacts them wherever they land.
    redact: {
      paths: [
        "accessCode",
        "body.accessCode",
        "*.accessCode",
        "headers.authorization",
        "headers.accessCode",
        "*.headers.authorization",
        "*.headers.accessCode",
      ],
      censor: "[redacted]",
    },
  },
  prettyStream,
);

export const serverLogger = logger.child({ module: "server" });
export const dbLogger = logger.child({ module: "database" });
export const httpLogger = logger.child({ module: "http" });
export const webhookLogger = logger.child({ module: "webhook" });
export const counselLogger = logger.child({ module: "counsel" });
