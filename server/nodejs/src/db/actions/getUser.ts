import { getDb } from "@/db/db";
import { DBRowNotFoundError } from "../lib/dbErrors";
import { UserDBSchema } from "../schemas/user";

type UserRow = {
  id: string;
  counsel_user_id: string;
  name: string;
  email: string;
  info: string;
};

export async function getUser(userId: string) {
  const db = await getDb();
  const user = db
    .prepare<UserRow, [string]>("SELECT * FROM users WHERE id = ?")
    .get(userId);
  if (!user) {
    throw new DBRowNotFoundError("User not found");
  }
  return UserDBSchema.parse({
    ...user,
    // DB value comes back as a string, so we need to parse it into an object
    info: JSON.parse(user.info),
  });
}
