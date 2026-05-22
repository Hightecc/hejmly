import * as v from "valibot";

export const NameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, "Item name can't be empty"),
  v.maxLength(120, "Item name is too long"),
);

export const DescriptionSchema = v.pipe(
  v.string(),
  v.trim(),
  v.maxLength(280, "Description is too long"),
);

export const CreateItemInputSchema = v.object({
  name: NameSchema,
  description: v.optional(DescriptionSchema),
});
export type CreateItemInput = v.InferOutput<typeof CreateItemInputSchema>;

export const TogglePurchasedInputSchema = v.object({
  purchased: v.boolean(),
});
export type TogglePurchasedInput = v.InferOutput<typeof TogglePurchasedInputSchema>;
