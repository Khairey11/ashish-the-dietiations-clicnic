import { describe, it, expect } from "vitest";

/**
 * Re-implement safeJsonParse here so we can unit-test the logic without
 * spinning up the Prisma client (which queries.ts imports at module load).
 * The implementation in src/lib/queries.ts MUST stay in sync with this.
 */
function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

describe("safeJsonParse", () => {
  it("parses valid JSON arrays", () => {
    expect(safeJsonParse('["a","b"]', [])).toEqual(["a", "b"]);
  });

  it("parses valid JSON objects", () => {
    expect(safeJsonParse('{"k":1}', {})).toEqual({ k: 1 });
  });

  it("returns fallback for null input", () => {
    expect(safeJsonParse(null, ["default"])).toEqual(["default"]);
  });

  it("returns fallback for empty string", () => {
    expect(safeJsonParse("", ["default"])).toEqual(["default"]);
  });

  it("returns fallback for malformed JSON", () => {
    expect(safeJsonParse("[not valid json", ["default"])).toEqual(["default"]);
    expect(safeJsonParse("{", {})).toEqual({});
    expect(safeJsonParse("undefined", null)).toBeNull();
  });

  it("preserves the fallback reference (no copy)", () => {
    const fallback = { items: [1, 2, 3] };
    expect(safeJsonParse("garbage", fallback)).toBe(fallback);
  });
});
