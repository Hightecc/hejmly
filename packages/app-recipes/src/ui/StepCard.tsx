import { ArrowsSplitIcon } from "@phosphor-icons/react";
import type { ReactElement } from "react";
import type { RecipeStep, TimerMap } from "../shared/index.ts";
import { StepIngredients } from "./StepIngredients.tsx";
import { TimeChip } from "./TimeChip.tsx";

type StepCardProps = {
  step: RecipeStep;
  index: number;
  accent: string;
  timers: TimerMap;
  now: number;
  showIngredients: boolean;
  onStart: (id: string, label: string, minutes: number) => void;
  onCancel: (id: string) => void;
};

export const StepCard = ({
  step,
  index,
  accent,
  timers,
  now,
  showIngredients,
  onStart,
  onCancel,
}: StepCardProps): ReactElement => (
  <div className="flex gap-3.5 py-4">
    <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-slate-900 font-semibold text-[13px] text-white tabular-nums">
      {index + 1}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-[15px] text-slate-900 leading-tight">{step.title}</h3>
        {step.concurrent && (
          <span className="inline-flex items-center gap-1 font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
            <ArrowsSplitIcon size={11} weight="bold" /> meanwhile
          </span>
        )}
      </div>
      <p className="mt-1 text-pretty text-[14px] text-slate-600 leading-relaxed">{step.body}</p>
      {showIngredients && step.uses.length > 0 && <StepIngredients items={step.uses} />}
      {step.timers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {step.timers.map((timer) => (
            <TimeChip
              key={timer.id}
              id={timer.id}
              minutes={timer.minutes}
              label={timer.label}
              timer={timers[timer.id]}
              now={now}
              accent={accent}
              onStart={onStart}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);
