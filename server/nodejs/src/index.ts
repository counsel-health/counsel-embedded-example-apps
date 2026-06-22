import app from "@/app";
import { getDb } from "@/db/db";
import { env, loadEnvConfig } from "@/envConfig";
import { serverLogger } from "@/lib/logger";

loadEnvConfig();

// Bind 0.0.0.0 (all IPv4) explicitly. Bun's default bind is the IPv6 wildcard `::`,
// which is dual-stack on Linux (so Cloud Run is unaffected) but IPv6-only on macOS —
// there it refuses the IPv4 connection the Android emulator makes via 10.0.2.2, so the
// app gets "Network" / connection-refused even though `curl localhost` works. 0.0.0.0
// is also the conventional bind for Cloud Run, so this is correct in every environment.
app.listen({ port: env.PORT, hostname: "0.0.0.0" }, (server) => {
  // Seed the in-memory database
  getDb()
    .then(() => {
      serverLogger.info("Database initialized");
    })
    .catch((error) => {
      serverLogger.error({ err: error }, "Critical error initializing the database");
      process.exit(1);
    });

  // Log the address/family we actually bound to, not just the configured port. An
  // IPv6-only bind (or a stale process holding IPv4) is invisible from the port number
  // alone but is exactly what makes a client — e.g. the Android emulator's 10.0.2.2,
  // which is IPv4-only — fail to reach the server. See server.hostname for the family.
  serverLogger.info(
    {
      host: server?.hostname,
      port: server?.port ?? env.PORT,
      url: server?.url?.href,
      nodeEnv: process.env.NODE_ENV ?? "undefined",
    },
    `Server is running on ${server?.url?.href ?? `http://localhost:${env.PORT}`}`,
  );
});
