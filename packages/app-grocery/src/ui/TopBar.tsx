import type { ReactElement } from "react";

type TopBarProps = {
  count: number;
  doneCount?: number;
  queuedCount: number;
};

export const TopBar = ({ count, doneCount, queuedCount }: TopBarProps): ReactElement => (
  <header className="shrink-0 bg-white px-5 pt-[max(env(safe-area-inset-top),0.5rem)] pb-3">
    <div className="flex items-center justify-between">
      <h1 className="font-semibold text-2xl text-slate-900 tracking-tight">Grocery</h1>
      {queuedCount > 0 && (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-[11px] text-amber-700 tabular-nums">
          {queuedCount} queued
        </span>
      )}
    </div>
    <p className="mt-0.5 text-slate-500 text-sm tabular-nums">
      {count} {count === 1 ? "item" : "items"}
      {doneCount !== undefined && doneCount > 0 && ` · ${doneCount} done`}
    </p>
  </header>
);
