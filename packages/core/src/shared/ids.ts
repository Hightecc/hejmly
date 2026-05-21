import * as v from "valibot";

declare const brand: unique symbol;
export type Brand<T, B> = T & { readonly [brand]: B };

export const UserIdSchema = v.pipe(v.string(), v.minLength(1), v.brand("UserId"));
export type UserId = v.InferOutput<typeof UserIdSchema>;
export const parseUserId = (raw: unknown): UserId => v.parse(UserIdSchema, raw);
