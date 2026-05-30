# app-recipes

Owns the recipes feature. Ships TWO subpaths today:

- `./shared` — isomorphic; branded `RecipeId`, recipe/ingredient/step types,
  category, the timer state machine, and duration formatting.
- `./ui` — React components (recipe detail pieces, ingredient rows, the
  tappable `TimeChip` + `useTimers` hook, the floating timer stack, browse
  cards).

`./server` and `./tools` are not built yet — recipe data is seeded in the web
app for v0. When persistence lands, add them here mirroring `app-grocery`.

## Local rules

- Timer logic is a pure state machine in `src/shared/timers.ts`: `startTimer`,
  `cancelTimer`, and the `viewTimer` selector. The UI `useTimers` hook is the
  only place `Date.now()` is read; the reducer always takes `now` as a
  parameter so it stays testable. DO NOT FORK IT.
- `RecipeCategory` is the closed set `Starter | Main | Dessert | Other`
  (`src/shared/category.ts`), validated with Valibot.
- UI components in `src/ui/` must pass `.claude/rules/mobile.md` and reuse the
  shadcn primitives from `apps/web/src/components/ui` where a modal/menu is
  needed.
- The `.animate-oh-ring` utility (the timer-complete pulse) is defined in
  `apps/web/src/styles.css`, which also `@source`s this package so Tailwind
  emits its classes.
