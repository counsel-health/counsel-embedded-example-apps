import { Elysia } from "elysia";
import jwt from "jsonwebtoken";
import ms from "ms";
import { env } from "@/envConfig";
import { UserFacingError } from "@/lib/http";

export type User = {
  userId: string;
  client: string;
  accessCode: string;
};

type JWTPayload = jwt.JwtPayload & User;

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
  const payload: User = { userId, client, accessCode };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

/**
 * Elysia plugin that verifies the Bearer JWT and injects a typed `user`
 * into the request context. Throws UserFacingError on auth failure so the
 * global onError handler can log and format the response consistently.
 */
export const withAuth = new Elysia({ name: "withAuth" }).derive(
  { as: "scoped" },
  ({ headers }) => {
    const token = headers["authorization"]?.split(" ")[1];

    if (!token) {
      throw new UserFacingError("No token provided", 401);
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      return {
        user: {
          userId: decoded.userId,
          client: decoded.client,
          accessCode: decoded.accessCode,
        },
      };
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        throw new UserFacingError("Token expired", 400);
      }
      throw new UserFacingError("Invalid token", 401);
    }
  }
);
