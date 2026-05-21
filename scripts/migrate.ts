#!/usr/bin/env bun
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { createDb } from "../packages/core/src/server/db/index.ts";

const dbPath = process.env.DATABASE_PATH ?? "./data/app.db";

if (dbPath !== ":memory:") {
  mkdirSync(dirname(resolve(dbPath)), { recursive: true });
}

const db = createDb({ path: dbPath });
migrate(db, { migrationsFolder: "./drizzle" });

console.info(`migrate: applied migrations to ${dbPath}`);
