import { Request } from "express";
import { z } from "zod";

export class HttpError extends Error {
  /**
   * @description The HTTP status code
   */
  status: number;
  /**
   * @description Additional details about the error
   */
  details?: Record<string, unknown>;

  constructor(message: string, status: number, details?: Record<string, unknown>) {
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

/**
 * @description Get the body of an incoming request
 * @param request - The incoming request
 * @param schema - The schema to validate the body against
 * @returns A promise that resolves to the body of the request
 */
export async function parseBody<S extends z.ZodSchema>(
  request: Request,
  schema: S
): Promise<z.infer<S>> {
  if (!request.body) {
    throw new HttpError("Missing request body", 400);
  }
  const result = schema.safeParse(request.body);
  if (!result.success) {
    throw new HttpError("Invalid request body", 400, result.error.format());
  }
  return result.data;
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
