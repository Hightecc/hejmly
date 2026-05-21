import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

export const app = new Hono()
  .use("*", logger())
  .use("*", secureHeaders())
  .get("/healthz", (c) => c.json({ ok: true }));

export type AppType = typeof app;
