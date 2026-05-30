const MINUTE_MS = 60_000;

export type Timer = { label: string; durationMs: number; endsAt: number };

export type TimerMap = Readonly<Record<string, Timer>>;

export type TimerView =
  | { kind: "idle" }
  | { kind: "running"; remainingMs: number; fraction: number }
  | { kind: "done" };

export const startTimer = (
  timers: TimerMap,
  id: string,
  label: string,
  minutes: number,
  now: number,
): TimerMap => {
  const durationMs = Math.max(0, minutes) * MINUTE_MS;
  return { ...timers, [id]: { label, durationMs, endsAt: now + durationMs } };
};

export const cancelTimer = (timers: TimerMap, id: string): TimerMap => {
  if (!(id in timers)) return timers;
  const next: Record<string, Timer> = { ...timers };
  delete next[id];
  return next;
};

export const remainingMs = (timer: Timer, now: number): number => Math.max(0, timer.endsAt - now);

export const isDone = (timer: Timer, now: number): boolean => now >= timer.endsAt;

export const elapsedFraction = (timer: Timer, now: number): number => {
  if (timer.durationMs <= 0) return 1;
  const elapsed = timer.durationMs - remainingMs(timer, now);
  return Math.min(1, Math.max(0, elapsed / timer.durationMs));
};

export const hasActiveTimer = (timers: TimerMap, now: number): boolean =>
  Object.values(timers).some((timer) => !isDone(timer, now));

export const viewTimer = (timer: Timer | undefined, now: number): TimerView => {
  if (timer === undefined) return { kind: "idle" };
  if (isDone(timer, now)) return { kind: "done" };
  return {
    kind: "running",
    remainingMs: remainingMs(timer, now),
    fraction: elapsedFraction(timer, now),
  };
};
