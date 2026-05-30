import { CheckIcon } from "@phosphor-icons/react";
import type { ReactElement } from "react";
import { cn } from "./cn.ts";

type IngredientRowProps = { name: string; quantity: string; leader?: boolean };

export const IngredientRow = ({
  name,
  quantity,
  leader = false,
}: IngredientRowProps): ReactElement => (
  <div className="flex items-center gap-3 py-2.5">
    <span className="shrink-0 text-[15px] text-slate-800 leading-tight">{name}</span>
    {leader ? (
      <span className="mx-1 flex-1 translate-y-1 border-slate-300 border-b border-dotted" />
    ) : (
      <span className="min-w-0 flex-1" />
    )}
    <span className="shrink-0 text-right font-medium text-[14px] text-slate-500 tabular-nums">
      {quantity}
    </span>
  </div>
);

type IngredientToggleProps = {
  name: string;
  quantity: string;
  haveAtHome: boolean;
  checked: boolean;
  onToggle: () => void;
};

export const IngredientToggle = ({
  name,
  quantity,
  haveAtHome,
  checked,
  onToggle,
}: IngredientToggleProps): ReactElement => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={checked}
    className={cn(
      "flex min-h-11 w-full items-center gap-3 py-2 text-left",
      !checked && "opacity-60",
    )}
  >
    <span
      className={cn(
        "grid size-[22px] shrink-0 place-items-center rounded-md",
        checked ? "bg-slate-900" : "border-[1.5px] border-slate-300",
      )}
    >
      {checked && <CheckIcon size={12} weight="bold" className="text-white" />}
    </span>
    <span className="shrink-0 text-[15px] text-slate-800 leading-tight">{name}</span>
    <span className="min-w-0 flex-1" />
    {haveAtHome && (
      <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-[10px] text-emerald-700 uppercase tracking-wider">
        Have it
      </span>
    )}
    <span className="shrink-0 text-right font-medium text-[14px] text-slate-500 tabular-nums">
      {quantity}
    </span>
  </button>
);
