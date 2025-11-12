import { DatabaseSync } from "node:sqlite";
import { createUser } from "@/db/actions/createUser";
import { v4 as uuidv4 } from "uuid";
import { env } from "@/envConfig";

export async function seedUsers(db: DatabaseSync) {
  // Seed an initial user for each access code, grouped by userType (main or onboarding)
  // We need accessCode to fetch apiKey and apiUrl to create the user
  const accessCodes = Object.keys(env.ACCESS_CODE_CONFIGS);
  if (accessCodes.length === 0) {
    console.log("No access codes configured, skipping user seeding");
    return;
  }

  // Find all access codes for main and onboarding clients
  const mainConfigs = Object.entries(env.ACCESS_CODE_CONFIGS).filter(
    ([_, config]) => config.userType === "main"
  );
  const onboardingConfigs = Object.entries(env.ACCESS_CODE_CONFIGS).filter(
    ([_, config]) => config.userType === "onboarding"
  );

  const seedPromises = [];
  // Seed a user for each main userTypeaccess code
  for (const [accessCode] of mainConfigs) {
    seedPromises.push(
      createUser({
        userId: uuidv4(),
        accessCode,
        userType: "main",
        dbProvider: db,
      })
    );
  }
  // Seed a user for each onboarding userType access code
  for (const [accessCode] of onboardingConfigs) {
    seedPromises.push(
      createUser({
        userId: uuidv4(),
        accessCode,
        userType: "onboarding",
        dbProvider: db,
      })
    );
  }

  await Promise.all(seedPromises);
}
