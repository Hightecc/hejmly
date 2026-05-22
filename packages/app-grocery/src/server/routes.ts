import type { SessionVariables } from "@onehouse/core/server";
import { Hono } from "hono";
import { match } from "ts-pattern";
import * as v from "valibot";
import {
  CreateItemInputSchema,
  type GroceryError,
  TogglePurchasedInputSchema,
  UpdateItemInputSchema,
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

type ParsedBody<T> = { ok: true; value: T } | { ok: false };

const parseBody = async <S extends v.GenericSchema>(
  req: Request,
  schema: S,
): Promise<ParsedBody<v.InferOutput<S>>> => {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false };
  }
  const parsed = v.safeParse(schema, raw);
  if (!parsed.success) return { ok: false };
  return { ok: true, value: parsed.output };
};

const invalidInput = (message = "Invalid input") =>
  ({ kind: "invalid_input" as const, message }) as const;

const safely = async (label: string, p: Promise<void>): Promise<void> => {
  try {
    await p;
  } catch (e) {
    console.error(`grocery cleanup ${label} failed`, e);
  }
};

export const createGroceryRoutes = (deps: GroceryDeps) =>
  new Hono<{ Variables: SessionVariables }>()
    .get("/items", async (c) => {
      const items = await deps.service.list();
      return c.json({ items });
    })
    .post("/items", async (c) => {
      const parsed = await parseBody(c.req.raw, CreateItemInputSchema);
      if (!parsed.ok) return c.json(invalidInput(), 400);
      const user = c.get("user");
      const result = await deps.service.create(parsed.value, user.id);
      if (result.kind === "err") {
        const e = handleError(result.error);
        return c.json(e.body, e.status);
      }
      return c.json({ item: result.value }, 201);
    })
    .patch("/items/:id", async (c) => {
      const parsed = await parseBody(c.req.raw, TogglePurchasedInputSchema);
      if (!parsed.ok) return c.json(invalidInput(), 400);
      const id = parseGroceryItemId(c.req.param("id"));
      const user = c.get("user");
      const result = parsed.value.purchased
        ? await deps.service.markPurchased(id, user.id)
        : await deps.service.markPending(id);
      if (result.kind === "err") {
        const e = handleError(result.error);
        return c.json(e.body, e.status);
      }
      if (parsed.value.purchased) {
        await safely("schedule", deps.cleanup.schedule(id));
      } else {
        await safely("cancel", deps.cleanup.cancel(id));
      }
      return c.json({ item: result.value });
    })
    .patch("/items/:id/content", async (c) => {
      const parsed = await parseBody(c.req.raw, UpdateItemInputSchema);
      if (!parsed.ok) return c.json(invalidInput(), 400);
      const id = parseGroceryItemId(c.req.param("id"));
      const result = await deps.service.update(id, parsed.value);
      if (result.kind === "err") {
        const e = handleError(result.error);
        return c.json(e.body, e.status);
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
      await safely("cancel", deps.cleanup.cancel(id));
      return c.json({ id: result.value.id });
    });

export type GroceryRoutes = ReturnType<typeof createGroceryRoutes>;
