import type { ReactElement, ReactNode } from "react";
import { cn } from "./cn.ts";

type FilterChipProps = { active: boolean; onClick: () => void; children: ReactNode };

export const FilterChip = ({ active, onClick, children }: FilterChipProps): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "inline-flex min-h-11 shrink-0 items-center rounded-full px-3.5 font-medium text-[13px] transition",
      active ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600",
    )}
  >
    {children}
  </button>
);
