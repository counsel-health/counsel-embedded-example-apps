/**
 * A route-level error formatted by onError as `{ error: "..." }`.
 * Use for client-visible validation/business errors (bad input, wrong state).
 * Distinct from HttpError, which produces the infrastructure `{ errors: { message } }` shape.
 */
export class UserFacingError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "UserFacingError";
  }
}

export class HttpError extends Error {
  /**
   * @description The HTTP status code
   */
  status: number;
  /**
   * @description Additional details about the error
   */
  details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function isHttpError(error: Error): error is HttpError {
  return (
    "status" in error &&
    typeof error.status === "number" &&
    error.status > 200 &&
    error.status < 600
  );
}

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
