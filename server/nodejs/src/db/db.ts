import { DatabaseSync } from "node:sqlite";
import { seedUsers } from "./seeds/users";

let dbInstance: DatabaseSync | null = null;

/**
 * @description Get the database instance
 * @returns The database instance
 */
export async function getDb(): Promise<DatabaseSync> {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(":memory:");
    // 1. Create tables
    dbInstance.exec(`
      CREATE TABLE users(id TEXT PRIMARY KEY, counsel_user_id UUID, name TEXT, email TEXT, info JSONB);
    `);
    // 2. Seed the tables if we're in development mode
    if (process.env.NODE_ENV === "development") {
      await seedUsers(dbInstance);
      console.log("Database seeded");
    }
  }
  return dbInstance;
}
