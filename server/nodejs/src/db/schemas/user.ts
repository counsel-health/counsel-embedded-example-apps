import { z } from "zod";

export const UserInfoSchema = z.object({
  dob: z.string(),
  sex: z.string(),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  }),
  phone: z.string(),
  medicalProfile: z.object({
    conditions: z.array(z.string()),
    medications: z.array(z.string()),
  }),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  info: UserInfoSchema,
});

export const UserDBSchema = UserSchema.extend({
  counsel_user_id: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
