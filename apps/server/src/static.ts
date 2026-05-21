import { Hono } from "hono";

export const mountStatic = () =>
  new Hono().get("/*", (c) => c.text("static serving not yet wired", 501));
