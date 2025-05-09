import { createServer, IncomingMessage, ServerResponse } from "node:http";
import rootRoute from "./routes/index";
import chatSignedAppUrlRoute from "./routes/chat/signedAppUrl";
import chatUserRoute from "./routes/chat/user";
import { env, loadEnvConfig } from "./envConfig";
import { getDb } from "./db/db";

/**
 * @description The main server instance
 *
 * For now there is no actual authentication since this is just a demo app.
 */
const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  console.log("Request", req.url, req.method);

  try {
    if (req.url === "/") {
      return rootRoute(req, res);
    }

    if (req.url === "/chat/signedAppUrl" && req.method === "POST") {
      return chatSignedAppUrlRoute(req, res);
    }

    if (req.url === "/chat/user" && req.method === "POST") {
      return chatUserRoute(req, res);
    }

    res.statusCode = 404;
    res.end(
      JSON.stringify({
        error: "Not Found",
      })
    );
  } catch (error) {
    console.error("Error", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
});

server.listen(env.PORT, () => {
  // Parse the env config
  loadEnvConfig();

  // Seed the in-memory database
  getDb()
    .then(() => {
      console.log("In-memory database seeded");
    })
    .catch((error) => {
      console.error("Critical error seeding the in-memory database", error);
      process.exit(1);
    });

  console.log(`Server is running on http://localhost:${env.PORT}`);
});
