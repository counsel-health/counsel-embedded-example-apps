import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

export const safeCompare = (a: string, b: string) => {
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

/**
 * Express middleware to authenticate a bearer token.
 * The token is just an env variable for now.
 */
export const authenticateBearerToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ message: "Missing authorization header" });
    return;
  }

  // Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    res.status(401).json({ message: "Malformed authorization header" });
    return;
  }

  // Compare the token hash to the env variable
  // We removed this method of authentication in place of JWTs but leave this here in case we need it later on.
  if (!safeCompare(token, "DUMMY_TOKEN")) {
    res.status(401).json({ message: "Invalid bearer token" });
    return;
  }

  next();
};

export const stringCompare = (a: string, b: string): boolean => {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
};
