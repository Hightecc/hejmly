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

export const UpdateItemInputSchema = v.pipe(
  v.object({
    name: v.optional(NameSchema),
    description: v.optional(v.nullable(DescriptionSchema)),
  }),
  v.check(
    (input) => input.name !== undefined || input.description !== undefined,
    "Provide a name or description to update",
  ),
);
export type UpdateItemInput = v.InferOutput<typeof UpdateItemInputSchema>;
