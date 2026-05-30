import * as v from "valibot";

export const RecipeIdSchema = v.pipe(v.string(), v.minLength(1), v.brand("RecipeId"));
export type RecipeId = v.InferOutput<typeof RecipeIdSchema>;
export const parseRecipeId = (raw: unknown): RecipeId => v.parse(RecipeIdSchema, raw);
