import { Fragment, type ReactElement } from "react";
import type { StepIngredient } from "../shared/index.ts";

type StepIngredientsProps = { items: readonly StepIngredient[] };

export const StepIngredients = ({ items }: StepIngredientsProps): ReactElement => (
  <div className="mt-1.5 text-[12px] leading-relaxed">
    {items.map((item, index) => (
      <Fragment key={item.name}>
        {index > 0 && <span className="mx-1.5 text-slate-300">·</span>}
        <span className="text-slate-500">{item.name}</span>
        {item.quantity !== null && (
          <span className="text-slate-400 tabular-nums"> {item.quantity}</span>
        )}
      </Fragment>
    ))}
  </div>
);
