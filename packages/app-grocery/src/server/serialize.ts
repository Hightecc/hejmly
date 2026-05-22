import * as v from "valibot";
import {
  type GroceryAuthor,
  type GroceryItem,
  type GroceryStatus,
  parseGroceryItemId,
} from "../shared/index.ts";
import type { GroceryItemRow } from "./schema.ts";

const StoredStatusSchema = v.union([
  v.object({ kind: v.literal("pending") }),
  v.object({
    kind: v.literal("purchased"),
    purchasedAt: v.number(),
    purchasedBy: v.string(),
  }),
]);

const parseStatus = (raw: string): GroceryStatus => {
  const parsed: unknown = JSON.parse(raw);
  const result = v.safeParse(StoredStatusSchema, parsed);
  return result.success ? result.output : { kind: "pending" };
};

export const serializeStatus = (status: GroceryStatus): string => JSON.stringify(status);

const initialOf = (name: string): string => {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "·";
  const first = trimmed.split(/\s+/)[0] ?? trimmed;
  return first.charAt(0).toUpperCase();
};

const toAuthor = (
  user: { id: string; name: string | null; email: string | null } | null,
): GroceryAuthor => {
  if (user === null) return { id: "unknown", name: "Someone", initial: "·" };
  const displayName = user.name?.trim() ?? user.email ?? "Someone";
  return { id: user.id, name: displayName, initial: initialOf(displayName) };
};

export const rowToItem = (
  row: GroceryItemRow,
  author: { id: string; name: string | null; email: string | null } | null,
): GroceryItem => ({
  id: parseGroceryItemId(row.id),
  name: row.name,
  description: row.description,
  status: parseStatus(row.statusJson),
  createdAt: row.createdAt.getTime(),
  updatedAt: row.updatedAt.getTime(),
  addedBy: toAuthor(author),
});
