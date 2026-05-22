import type { ReactElement } from "react";

const ROW_HEIGHTS = [60, 64, 58, 66, 60, 64, 58] as const;

export const ListSkeleton = (): ReactElement => (
  <>
    <div className="shrink-0 bg-white px-5 pt-[max(env(safe-area-inset-top),0.5rem)] pb-3">
      <div className="h-7 w-28 animate-pulse rounded-md bg-slate-100" />
      <div className="mt-2 h-3.5 w-20 animate-pulse rounded bg-slate-100" />
    </div>
    <div className="flex-1 divide-y divide-slate-100 bg-white">
      {ROW_HEIGHTS.map((h, i) => (
        <div
          key={`skeleton-${i}-${h}`}
          className="flex items-center gap-3 px-5"
          style={{ height: h }}
        >
          <div className="size-6 animate-pulse rounded-full bg-slate-100" />
          <div className="flex-1">
            <div
              className="h-3.5 animate-pulse rounded bg-slate-100"
              style={{ width: `${40 + ((i * 17) % 45)}%` }}
            />
            {i % 2 === 0 && (
              <div
                className="mt-2 h-3 animate-pulse rounded bg-slate-100"
                style={{ width: `${25 + ((i * 11) % 35)}%` }}
              />
            )}
          </div>
          <div className="size-6 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  </>
);
