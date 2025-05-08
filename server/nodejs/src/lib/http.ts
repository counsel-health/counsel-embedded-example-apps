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

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay: number = 100
) {
  for (const _ of Array(retries).keys()) {
    try {
      return fetch(url, options);
    } catch (error) {
      console.warn(`Request to ${url} failed, retrying in ${delay}ms`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Request to ${url} failed after ${retries} retries`);
}
