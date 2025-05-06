import { IncomingMessage } from "node:http";
import { ZodSchema } from "zod";

/**
 * @description Get the body of an incoming request
 * @param request - The incoming request
 * @returns A promise that resolves to the body of the request
 */
export function getBody(
  request: IncomingMessage
): Promise<Record<string, unknown> | null> {
  return new Promise((resolve) => {
    const bodyParts: Buffer[] = [];
    let body: string;
    request
      .on("data", (chunk) => {
        bodyParts.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(bodyParts).toString();
        if (!body) {
          resolve(null);
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          console.error("Error parsing body", error);
          resolve(null);
        }
      });
  });
}
