import { z } from "zod";

export const SignedAppUrlResponseSchema = z.object({
  url: z.string(),
});

export const CounselTokenResponseSchema = z.object({
  token: z.string(),
});

export const SignUpResponseSchema = z.object({
  token: z.string(),
  userType: z.enum(["main", "onboarding"]),
  counselUserId: z.string(),
  authType: z.enum(["apiKey", "jwt"]),
});
