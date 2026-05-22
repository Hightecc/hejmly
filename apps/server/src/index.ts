import { dirname, resolve } from "node:path";
import { createCleanupScheduler, createGroceryService } from "@onehouse/app-grocery/server";
import { createAuth, createDb, parseAllowedEmails } from "@onehouse/core/server";
import { parseRuntimeEnv } from "@onehouse/core/shared";
import { createApp } from "./composition.ts";

const env = parseRuntimeEnv(process.env);

const db = createDb({ path: env.DATABASE_PATH });

const auth = createAuth({
  db,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  google: { clientId: env.GOOGLE_ID, clientSecret: env.GOOGLE_SECRET },
  allowedEmails: parseAllowedEmails(env.ONEHOUSE_ALLOWED_EMAILS),
  useSecureCookies: process.env.NODE_ENV === "production",
});

const groceryService = createGroceryService(db);
const cleanup = createCleanupScheduler({
  service: groceryService,
  dataPath: resolve(dirname(env.DATABASE_PATH), "grocery-cleanup.db"),
});

const app = createApp({
  auth,
  baseURL: env.BETTER_AUTH_URL,
  grocery: { service: groceryService, cleanup },
});

const server = Bun.serve({ port: env.PORT, fetch: app.fetch });

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  console.info(`onehouse server received ${signal}, shutting down`);
  await cleanup.close();
  await server.stop();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.info(`onehouse server listening on http://localhost:${env.PORT}`);
