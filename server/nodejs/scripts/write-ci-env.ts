/**
 * Writes `.env` in the server root from process.env for CI (e.g. GitHub Actions).
 *
 * - Minifies ACCESS_CODE_CONFIGS so pretty-printed JSON does not break .env line semantics.
 * - PEM values use escaped newlines (\\n) so they stay on one line; matches
 *   COUNSEL_PRIVATE_KEY_PEM handling in envConfigSchema.ts.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

function escapePemForDotenv(pem: string): string {
  return pem
    .replace(/\r\n/g, "\n")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n");
}

const compact = JSON.stringify(
  JSON.parse(process.env.ACCESS_CODE_CONFIGS ?? ""),
);

let body =
  `JWT_SECRET=${process.env.JWT_SECRET}\n` +
  `COUNSEL_WEBHOOK_SECRET=${process.env.COUNSEL_WEBHOOK_SECRET}\n` +
  `ACCESS_CODE_CONFIGS=${compact}\n`;

const pem = process.env.COUNSEL_PRIVATE_KEY_PEM;
if (pem?.trim()) {
  body += `COUNSEL_PRIVATE_KEY_PEM=${escapePemForDotenv(pem)}\n`;
}

const out = join(import.meta.dirname, "..", ".env");
writeFileSync(out, body);
