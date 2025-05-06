import { DatabaseSync } from "node:sqlite";
import { createCounselUser } from "../../lib/counsel";
import { User, UserSchema } from "../schemas/user";

const demoUser: User = {
  id: "1",
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
};

export async function seedUsers(db: DatabaseSync) {
  UserSchema.parse(demoUser);
  const user = await createCounselUser(demoUser);
  console.log("Created user in Counsel", user);
  const stmt = db.prepare(
    `
    INSERT INTO users (id, counsel_user_id, name, email, info) VALUES (?, ?, ?, ?, ?);
  `
  );
  stmt.run(
    demoUser.id,
    user.id,
    demoUser.name,
    demoUser.email,
    JSON.stringify(demoUser.info)
  );
}
