import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import ms from "ms";
import { env } from "@/envConfig";

export type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    client: string;
    accessCode: string;
  };
};

export const isAuthenticatedRequest = (req: Request): req is AuthenticatedRequest => {
  return (
    "user" in req &&
    typeof req.user === "object" &&
    req.user !== null &&
    "userId" in req.user &&
    typeof req.user.userId === "string" &&
    "client" in req.user &&
    typeof req.user.client === "string" &&
    "accessCode" in req.user &&
    typeof req.user.accessCode === "string" &&
    req.user.accessCode.length === 6
  );
};

type CustomJwtPayloadData = {
  userId: string;
  client: string;
  accessCode: string;
};

type JWTPayload = jwt.JwtPayload & CustomJwtPayloadData;

export const createJWTSession = ({
  userId,
  client,
  accessCode,
  /**
   * 30 days - some really long amount of time someone could have the demo app open for. Don't do this in your real app.
   * This is just for the demo app to preserve the user session for as long as possible. Since the JWT is basically the user's only identifier.
   */
  expiresIn = "30d",
}: {
  userId: string;
  client: string;
  accessCode: string;
  expiresIn?: ms.StringValue;
}) => {
  const payload: CustomJwtPayloadData = {
    userId,
    client,
    accessCode,
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
    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      client: decoded.client,
      accessCode: decoded.accessCode,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("Token expired", { error });
      res.status(400).json({ error: "Token expired" });
      return;
    }
    console.error("Token verification failed", { error });
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};
