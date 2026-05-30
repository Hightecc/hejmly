import { describe, expect, test } from "bun:test";
import { formatClock, formatMinutes } from "./format.ts";

describe("formatClock", () => {
  test("renders mm:ss with zero-padded seconds", () => {
    expect(formatClock(7 * 60_000 + 8_000)).toBe("7:08");
    expect(formatClock(60_000)).toBe("1:00");
    expect(formatClock(9_000)).toBe("0:09");
  });

  test("never goes below zero", () => {
    expect(formatClock(-5_000)).toBe("0:00");
  });

  test("rounds to the nearest second", () => {
    expect(formatClock(1_400)).toBe("0:01");
    expect(formatClock(1_600)).toBe("0:02");
  });
});

describe("formatMinutes", () => {
  test("shows plain minutes under an hour", () => {
    expect(formatMinutes(35)).toBe("35 min");
  });

  test("collapses whole hours", () => {
    expect(formatMinutes(60)).toBe("1 hr");
    expect(formatMinutes(180)).toBe("3 hr");
  });

  test("shows hours and minutes when there is a remainder", () => {
    expect(formatMinutes(75)).toBe("1 hr 15 min");
  });
});
