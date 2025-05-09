import { DatabaseSync } from "node:sqlite";
import { createCounselUser } from "@/lib/counsel";

const demoUser = (id: string) => ({
  id,
  name: "John Doe",
  email: "john.doe@example.com",
  info: {
    dob: "1990-01-01",
    sex: "Male",
    address: {
      line1: "123 Main St",
      line2: "Apt 1",
      city: "San Francisco",
      state: "CA",
      zip: "94101",
    },
    phone: "+18007006000",
    medicalProfile: {
      conditions: ["diabetes", "hypertension"],
      medications: ["metformin", "atenolol"],
    },
  },
});

export async function createUser(db: DatabaseSync, userId: string) {
  const newUser = demoUser(userId);
  const user = await createCounselUser(newUser);
  const stmt = db.prepare(
    `
    INSERT INTO users (id, counsel_user_id, name, email, info) VALUES (?, ?, ?, ?, ?);
  `
  );
  stmt.run(userId, user.id, newUser.name, newUser.email, JSON.stringify(newUser.info));
  console.log("Created user in DB", userId);
}
