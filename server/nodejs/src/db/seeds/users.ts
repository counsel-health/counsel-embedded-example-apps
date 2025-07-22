import { DatabaseSync } from "node:sqlite";
import { createUser } from "@/db/actions/createUser";
import { v4 as uuidv4 } from "uuid";

export async function seedUsers(db: DatabaseSync) {
  // Seed an initial user for each user type
  await Promise.all([
    createUser({ userId: uuidv4(), userType: "main", dbProvider: db }),
    createUser({ userId: uuidv4(), userType: "onboarding", dbProvider: db }),
  ]);
}
