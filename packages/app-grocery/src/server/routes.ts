import type { SessionVariables } from "@onehouse/core/server";
import { Hono } from "hono";
import { match } from "ts-pattern";
import * as v from "valibot";
import {
  CreateItemInputSchema,
  type GroceryError,
  TogglePurchasedInputSchema,
  groceryErrorStatus,
  parseGroceryItemId,
} from "../shared/index.ts";
import type { CleanupScheduler } from "./cleanup-scheduler.ts";
import type { GroceryService } from "./service.ts";

export type GroceryDeps = {
  service: GroceryService;
  cleanup: CleanupScheduler;
};

const handleError = (e: GroceryError) =>
  match(e)
    .with({ kind: "not_found" }, (it) => ({ status: groceryErrorStatus(it), body: it }) as const)
    .with(
      { kind: "invalid_input" },
      (it) => ({ status: groceryErrorStatus(it), body: it }) as const,
    )
    .with(
      { kind: "already_in_state" },
      (it) => ({ status: groceryErrorStatus(it), body: it }) as const,
    )
    .exhaustive();

export const createGroceryRoutes = (deps: GroceryDeps) =>
  new Hono<{ Variables: SessionVariables }>()
    .get("/items", async (c) => {
      const items = await deps.service.list();
      return c.json({ items });
    })
    .post("/items", async (c) => {
      const raw: unknown = await c.req.json();
      const parsed = v.safeParse(CreateItemInputSchema, raw);
      if (!parsed.success) {
        return c.json(
          { kind: "invalid_input", message: parsed.issues[0]?.message ?? "Invalid input" },
          400,
        );
      }
      const user = c.get("user");
      const result = await deps.service.create(parsed.output, user.id);
      if (result.kind === "err") {
        const e = handleError(result.error);
        return c.json(e.body, e.status);
      }
      return c.json({ item: result.value }, 201);
    })
    .patch("/items/:id", async (c) => {
      const raw: unknown = await c.req.json();
      const parsed = v.safeParse(TogglePurchasedInputSchema, raw);
      if (!parsed.success) {
        return c.json(
          { kind: "invalid_input", message: parsed.issues[0]?.message ?? "Invalid input" },
          400,
        );
      }
      const id = parseGroceryItemId(c.req.param("id"));
      const user = c.get("user");
      const result = parsed.output.purchased
        ? await deps.service.markPurchased(id, user.id)
        : await deps.service.markPending(id);
      if (result.kind === "err") {
        const e = handleError(result.error);
        return c.json(e.body, e.status);
      }
      if (parsed.output.purchased) {
        await deps.cleanup.schedule(id);
      } else {
        await deps.cleanup.cancel(id);
      }
      return c.json({ item: result.value });
    })
    .delete("/items/:id", async (c) => {
      const id = parseGroceryItemId(c.req.param("id"));
      const result = await deps.service.remove(id);
      if (result.kind === "err") {
        const e = handleError(result.error);
        return c.json(e.body, e.status);
      }
      await deps.cleanup.cancel(id);
      return c.json({ id: result.value.id });
    });

export type GroceryRoutes = ReturnType<typeof createGroceryRoutes>;
