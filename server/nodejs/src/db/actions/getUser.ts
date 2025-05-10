import { getDb } from "@/db/db";
import { UserDBSchema } from "../schemas/user";
import { DBRowNotFoundError } from "../lib/dbErrors";

export async function getUser(userId: string) {
  const db = await getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!user) {
    throw new DBRowNotFoundError("User not found");
  }
  return UserDBSchema.parse({
    ...user,
    // DB value comes back as a string, so we need to parse it into an object
    info: JSON.parse(user.info as string),
  });
}
