import { z } from "zod";
import { getDb } from "@/db/db";

const UserDBSchema = z.object({
  id: z.string(),
  counsel_user_id: z.string(),
  // Add more fields as needed
});

export async function getUser(userId: string) {
  const db = await getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return UserDBSchema.parse(user);
}
