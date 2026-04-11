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
    name: "nextjs",
    level: process.env.NODE_ENV !== "production" ? "debug" : "info",
  },
  prettyStream,
);

export const serverLogger = logger.child({ module: "server" });
export const authLogger = logger.child({ module: "auth" });
export const httpLogger = logger.child({ module: "http" });
