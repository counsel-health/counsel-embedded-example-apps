import { DatabaseSync } from "node:sqlite";
import { createUser } from "@/db/actions/createUser";

export async function seedUsers(db: DatabaseSync) {
  // Seed an initial user
  await createUser("7661f3ee-f4c6-4833-91d0-77c8d4452820", db);
}
