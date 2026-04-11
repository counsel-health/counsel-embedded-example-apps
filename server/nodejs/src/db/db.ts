import { Database } from "bun:sqlite";
import { seedUsers } from "./seeds/users";
import { dbLogger } from "@/lib/logger";

let dbInstance: Database | null = null;

/**
 * @description Get the database instance
 * @returns The database instance
 */
export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = new Database(":memory:");
    // 1. Create tables
    dbInstance.exec(`
      CREATE TABLE users(id TEXT PRIMARY KEY, counsel_user_id UUID, name TEXT, email TEXT, info JSONB);
    `);
    // 2. Seed the tables if we're in development mode
    if (process.env.NODE_ENV === "development") {
      await seedUsers(dbInstance);
      dbLogger.info("Database seeded");
    }
  }
  return dbInstance;
}
