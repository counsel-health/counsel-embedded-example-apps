import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import ms from "ms";
import { env } from "@/envConfig";

export type AuthenticatedRequest = Request & {
  user: {
    userId: string;
  };
};

export const isAuthenticatedRequest = (req: Request): req is AuthenticatedRequest => {
  return (
    "user" in req &&
    typeof req.user === "object" &&
    req.user !== null &&
    "userId" in req.user &&
    typeof req.user.userId === "string"
  );
};

type CustomJwtPayloadData = {
  userId: string;
};

type JWTPayload = jwt.JwtPayload & CustomJwtPayloadData;

export const createJWTSession = (userId: string, expiresIn: ms.StringValue = "1h") => {
  const payload: CustomJwtPayloadData = {
    userId,
  };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

// Middleware to verify JWT token
export const verifyJWTSession = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    (req as AuthenticatedRequest).user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.error("Token verification failed", { error });
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};
