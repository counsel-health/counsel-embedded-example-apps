import { httpLogger } from "@/lib/logger";

/**
 * @description Fetch with retry
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay: number = 100
) {
  for (const _ of Array(retries).keys()) {
    try {
      return await fetch(url, options);
    } catch (error) {
      httpLogger.warn({ url, delay, err: error }, "Request failed, retrying");
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Request to ${url} failed after ${retries} retries`);
}
