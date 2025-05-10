import { DatabaseSync } from "node:sqlite";
import { createUser } from "@/db/actions/createUser";

export async function seedUsers(db: DatabaseSync) {
  // Seed an initial user
  await createUser("1", db);
}
