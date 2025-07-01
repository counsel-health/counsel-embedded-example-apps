import app from "@/app";
import { env, loadEnvConfig } from "@/envConfig";
import { getDb } from "@/db/db";

loadEnvConfig();

app
  .listen(env.PORT, () => {
    // Seed the in-memory database
    getDb()
      .then(() => {
        console.log("Database initialized");
      })
      .catch((error) => {
        console.error("Critical error initializing the database", error);
        process.exit(1);
      });

    console.log(`Server is running on http://localhost:${env.PORT}`);
  })
  .on("error", (e) => console.error(e));
