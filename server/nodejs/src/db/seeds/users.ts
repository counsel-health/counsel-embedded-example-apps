import { DatabaseSync } from "node:sqlite";
import { createUser } from "../actions/createUser";

export async function seedUsers(db: DatabaseSync) {
  // Seed an initial user
  await createUser(db, "1");
}
