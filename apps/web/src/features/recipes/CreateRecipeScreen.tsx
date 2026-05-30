import {
  type CreateRecipeInput,
  RECIPE_CATEGORIES,
  type RecipeCategory,
} from "@onehouse/app-recipes/shared";
import { MinusIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { type ReactElement, type ReactNode, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/cn";
import { createRecipe } from "@/lib/recipes-api";

type IngredientDraft = { id: string; name: string; quantity: string };
type StepDraft = { id: string; title: string; body: string; minutes: string };

const newIngredient = (): IngredientDraft => ({ id: crypto.randomUUID(), name: "", quantity: "" });
const newStep = (): StepDraft => ({ id: crypto.randomUUID(), title: "", body: "", minutes: "" });

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const Field = ({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div>
    <span className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider">
      {label}
      {optional && (
        <span className="font-normal text-slate-400 normal-case tracking-normal"> — optional</span>
      )}
    </span>
    <div className="mt-1.5">{children}</div>
  </div>
);

const Stepper = ({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  onChange: (next: number) => void;
}): ReactElement => (
  <div>
    <span className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider">
      {label}
    </span>
    <div className="mt-1.5 flex min-h-12 items-center justify-between rounded-xl border border-slate-200 bg-white px-3">
      <span className="font-medium text-[15px] text-slate-900 tabular-nums">
        {value}
        {suffix !== undefined && <span className="text-slate-400"> {suffix}</span>}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(value - 1)}
          className="grid size-11 place-items-center rounded-lg border border-slate-200 text-slate-600 transition active:bg-slate-50"
        >
          <MinusIcon size={14} weight="bold" />
        </button>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
          className="grid size-11 place-items-center rounded-lg border border-slate-200 text-slate-600 transition active:bg-slate-50"
        >
          <PlusIcon size={14} weight="bold" />
        </button>
      </div>
    </div>
  </div>
);

const textInput =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900";

export const CreateRecipeScreen = (): ReactElement => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<RecipeCategory>("Main");
  const [description, setDescription] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [serves, setServes] = useState(2);
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(() => [newIngredient()]);
  const [steps, setSteps] = useState<StepDraft[]>(() => [newStep()]);
  const [error, setError] = useState<string | null>(null);

  const setIngredient = (index: number, patch: Partial<IngredientDraft>): void =>
    setIngredients((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const setStep = (index: number, patch: Partial<StepDraft>): void =>
    setSteps((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const create = useMutation({
    mutationFn: createRecipe,
    onSuccess: (recipe) => {
      void qc.invalidateQueries({ queryKey: ["recipes", "list"] });
      toast.success("Recipe saved");
      void navigate({ to: "/recipes/$recipeId", params: { recipeId: recipe.id } });
    },
    onError: () => toast.error("Couldn't save recipe"),
  });

  const handleSave = (): void => {
    const cleanIngredients = ingredients
      .map((i) => ({ name: i.name.trim(), quantity: i.quantity.trim() }))
      .filter((i) => i.name.length > 0);
    const cleanSteps = steps
      .map((s) => ({ title: s.title.trim(), body: s.body.trim(), minutes: s.minutes.trim() }))
      .filter((s) => s.title.length > 0 && s.body.length > 0);

    if (title.trim().length === 0) {
      setError("Give your recipe a title.");
      return;
    }
    if (cleanIngredients.length === 0) {
      setError("Add at least one ingredient.");
      return;
    }
    if (cleanSteps.length === 0) {
      setError("Add at least one step with instructions.");
      return;
    }

    const input: CreateRecipeInput = {
      title: title.trim(),
      description: description.trim(),
      category,
      minutes,
      serves,
      ingredients: cleanIngredients.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        haveAtHome: false,
      })),
      steps: cleanSteps.map((s) => {
        const parsed = Number.parseInt(s.minutes, 10);
        const timers =
          Number.isFinite(parsed) && parsed > 0
            ? [{ id: crypto.randomUUID(), minutes: clamp(parsed, 1, 1440), label: s.title }]
            : [];
        return { title: s.title, body: s.body, concurrent: false, uses: [], timers };
      }),
    };

    setError(null);
    create.mutate(input);
  };

  return (
    <main className="flex min-h-dvh flex-col bg-slate-50">
      <header className="flex h-12 shrink-0 items-center justify-between border-slate-100 border-b bg-white px-3 pt-[env(safe-area-inset-top)]">
        <Link
          to="/recipes"
          className="px-2 font-medium text-[15px] text-slate-500 active:text-slate-700"
        >
          Cancel
        </Link>
        <div className="font-semibold text-[15px] text-slate-900">New recipe</div>
        <div className="w-[52px] shrink-0" />
      </header>

      <div className="flex-1 overflow-y-auto bg-white px-5 pt-4 pb-28">
        <div className="space-y-4">
          <Field label="Title">
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="words"
              aria-label="Title"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              placeholder="Tomato Butter Rigatoni"
              className={textInput}
            />
          </Field>

          <Field label="Category">
            <div className="flex flex-wrap gap-2">
              {RECIPE_CATEGORIES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  aria-pressed={category === option}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-xl px-3.5 font-medium text-[13px] transition",
                    category === option
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Description" optional>
            <textarea
              inputMode="text"
              autoComplete="off"
              autoCapitalize="sentences"
              aria-label="Description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              placeholder="A glossy, almost-creamy tomato sauce."
              className="min-h-12 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Stepper
              label="Total time"
              value={minutes}
              suffix="min"
              onChange={(next) => setMinutes(clamp(next, 1, 1440))}
            />
            <Stepper
              label="Serves"
              value={serves}
              onChange={(next) => setServes(clamp(next, 1, 50))}
            />
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-[11px] text-slate-400 uppercase tracking-[0.12em]">
            Ingredients
          </h2>
          <div className="mt-2.5 space-y-2">
            {ingredients.map((row, index) => (
              <div key={row.id} className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  aria-label={`Ingredient ${index + 1} name`}
                  value={row.name}
                  onChange={(e) => setIngredient(index, { name: e.currentTarget.value })}
                  placeholder="Ingredient"
                  className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
                />
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  aria-label={`Ingredient ${index + 1} quantity`}
                  value={row.quantity}
                  onChange={(e) => setIngredient(index, { quantity: e.currentTarget.value })}
                  placeholder="Qty"
                  className="min-h-11 w-[84px] rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 tabular-nums outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
                />
                <button
                  type="button"
                  aria-label="Remove ingredient"
                  onClick={() =>
                    setIngredients((prev) =>
                      prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
                    )
                  }
                  className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-300 transition active:bg-slate-100 active:text-slate-500"
                >
                  <XIcon size={14} weight="bold" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setIngredients((prev) => [...prev, newIngredient()])}
              className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 border-dashed font-medium text-[14px] text-slate-500 transition active:bg-slate-50"
            >
              <PlusIcon size={15} weight="bold" />
              Add ingredient
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-[11px] text-slate-400 uppercase tracking-[0.12em]">
            Steps
          </h2>
          <div className="mt-2.5 space-y-4">
            {steps.map((row, index) => (
              <div key={row.id} className="flex gap-3">
                <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-slate-900 font-semibold text-[13px] text-white">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCapitalize="sentences"
                    aria-label={`Step ${index + 1} title`}
                    value={row.title}
                    onChange={(e) => setStep(index, { title: e.currentTarget.value })}
                    placeholder="Step title"
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
                  />
                  <textarea
                    inputMode="text"
                    autoComplete="off"
                    autoCapitalize="sentences"
                    aria-label={`Step ${index + 1} instructions`}
                    rows={2}
                    value={row.body}
                    onChange={(e) => setStep(index, { body: e.currentTarget.value })}
                    placeholder="What to do…"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-700 leading-relaxed outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label={`Step ${index + 1} timer minutes`}
                      value={row.minutes}
                      onChange={(e) =>
                        setStep(index, { minutes: e.currentTarget.value.replace(/[^0-9]/g, "") })
                      }
                      placeholder="Timer min"
                      className="min-h-11 w-[120px] rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 tabular-nums outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
                    />
                    <button
                      type="button"
                      aria-label="Remove step"
                      onClick={() =>
                        setSteps((prev) =>
                          prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
                        )
                      }
                      className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-300 transition active:bg-slate-100 active:text-slate-500"
                    >
                      <XIcon size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSteps((prev) => [...prev, newStep()])}
              className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 border-dashed font-medium text-[14px] text-slate-500 transition active:bg-slate-50"
            >
              <PlusIcon size={15} weight="bold" />
              Add step
            </button>
          </div>
        </div>

        {error !== null && (
          <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
            {error}
          </div>
        )}
      </div>

      <div className="shrink-0 border-slate-100 border-t bg-white px-5 pt-2.5 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <button
          type="button"
          disabled={create.isPending}
          onClick={handleSave}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 font-semibold text-base text-white transition active:scale-[0.99] disabled:opacity-40"
        >
          {create.isPending ? "Saving…" : "Save recipe"}
        </button>
      </div>
    </main>
  );
};
