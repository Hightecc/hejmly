import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mountStatic } from "./static.ts";

let root: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "onehouse-dist-"));
  mkdirSync(join(root, "assets"));
  writeFileSync(join(root, "index.html"), "<!doctype html><title>onehouse</title>");
  writeFileSync(join(root, "assets", "app.js"), "globalThis.__onehouse = true;");
  writeFileSync(join(root, "manifest.webmanifest"), '{"name":"onehouse"}');
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("mountStatic", () => {
  test("GET / serves index.html", async () => {
    const app = mountStatic(root);
    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(await res.text()).toContain("<title>onehouse</title>");
  });

  test("GET /assets/* serves the real asset with its own content-type", async () => {
    const app = mountStatic(root);
    const res = await app.request("/assets/app.js");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("javascript");
    expect(await res.text()).toBe("globalThis.__onehouse = true;");
  });

  test("GET a real top-level file serves it, not the SPA fallback", async () => {
    const app = mountStatic(root);
    const res = await app.request("/manifest.webmanifest");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('{"name":"onehouse"}');
  });

  test("GET an unknown client route falls back to index.html", async () => {
    const app = mountStatic(root);
    const res = await app.request("/recipes/abc123");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(await res.text()).toContain("<title>onehouse</title>");
  });
});
