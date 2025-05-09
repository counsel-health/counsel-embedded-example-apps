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
      console.warn(`Request to ${url} failed, retrying in ${delay}ms`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Request to ${url} failed after ${retries} retries`);
}
