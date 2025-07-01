import { DatabaseSync } from "node:sqlite";
import { createUser } from "@/db/actions/createUser";
import { v4 as uuidv4 } from "uuid";

export async function seedUsers(db: DatabaseSync) {
  // Seed an initial user
  await createUser(uuidv4(), db);
}
