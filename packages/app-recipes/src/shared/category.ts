import * as v from "valibot";

export const RECIPE_CATEGORIES = ["Starter", "Main", "Dessert", "Other"] as const;

export const RecipeCategorySchema = v.picklist(RECIPE_CATEGORIES);
export type RecipeCategory = v.InferOutput<typeof RecipeCategorySchema>;
export const parseRecipeCategory = (raw: unknown): RecipeCategory =>
  v.parse(RecipeCategorySchema, raw);
