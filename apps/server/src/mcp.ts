import { Hono } from "hono";

export const mountMcp = () =>
  new Hono().all("/", (c) => c.json({ error: "mcp not yet wired" }, 501));
