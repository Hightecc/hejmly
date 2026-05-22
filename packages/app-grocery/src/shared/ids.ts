import * as v from "valibot";

export const GroceryItemIdSchema = v.pipe(v.string(), v.minLength(1), v.brand("GroceryItemId"));
export type GroceryItemId = v.InferOutput<typeof GroceryItemIdSchema>;
export const parseGroceryItemId = (raw: unknown): GroceryItemId =>
  v.parse(GroceryItemIdSchema, raw);
