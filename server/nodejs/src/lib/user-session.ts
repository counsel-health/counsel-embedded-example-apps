import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import ms from "ms";
import { env } from "@/envConfig";
import { UserType } from "./counsel";

export type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    userType: UserType;
  };
};

export const isAuthenticatedRequest = (req: Request): req is AuthenticatedRequest => {
  return (
    "user" in req &&
    typeof req.user === "object" &&
    req.user !== null &&
    "userId" in req.user &&
    typeof req.user.userId === "string" &&
    "userType" in req.user &&
    typeof req.user.userType === "string"
  );
};

type CustomJwtPayloadData = {
  userId: string;
  userType: UserType;
};

type JWTPayload = jwt.JwtPayload & CustomJwtPayloadData;

export const createJWTSession = ({
  userId,
  userType,
  expiresIn = "1h",
}: {
  userId: string;
  userType: UserType;
  expiresIn?: ms.StringValue;
}) => {
  const payload: CustomJwtPayloadData = {
    userId,
    userType,
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
    (req as AuthenticatedRequest).user = { userId: decoded.userId, userType: decoded.userType };
    next();
  } catch (error) {
    console.error("Token verification failed", { error });
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};
