import { match } from "ts-pattern";
import type { RecipeId } from "./ids.ts";

export type RecipeError =
  | { kind: "not_found"; id: RecipeId }
  | { kind: "invalid_input"; message: string };

export const recipeErrorStatus = (e: RecipeError): 400 | 404 =>
  match(e)
    .with({ kind: "not_found" }, () => 404 as const)
    .with({ kind: "invalid_input" }, () => 400 as const)
    .exhaustive();
