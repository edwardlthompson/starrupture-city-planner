import { describe, expect, it } from "vitest";
import type { UnlockEntry } from "../core/types";
import { buildingOrder, comesBefore, sortByOrder, validateOrdering } from "./ordering";

describe("sortByOrder", () => {
  it("sorts by order ascending", () => {
    const input: UnlockEntry[] = [
      { buildingId: "c", order: 3 },
      { buildingId: "a", order: 1 },
      { buildingId: "b", order: 2 },
    ];
    const result = sortByOrder(input);
    expect(result.map((e) => e.buildingId)).toEqual(["a", "b", "c"]);
  });

  it("does not mutate the input", () => {
    const input: UnlockEntry[] = [
      { buildingId: "b", order: 2 },
      { buildingId: "a", order: 1 },
    ];
    const original = [...input];
    sortByOrder(input);
    expect(input).toEqual(original);
  });
});

describe("validateOrdering", () => {
  it("accepts a valid contiguous 1..N sequence", () => {
    const entries: UnlockEntry[] = [
      { buildingId: "a", order: 1 },
      { buildingId: "b", order: 2 },
      { buildingId: "c", order: 3 },
    ];
    const result = validateOrdering(entries);
    expect(result.ok).toBe(true);
  });

  it("rejects empty checklist", () => {
    const result = validateOrdering([]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain("checklist must not be empty");
  });

  it("rejects a gap in ordering", () => {
    const entries: UnlockEntry[] = [
      { buildingId: "a", order: 1 },
      { buildingId: "c", order: 3 }, // gap: 2 is missing
    ];
    const result = validateOrdering(entries);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes("expected order 2"))).toBe(true);
  });

  it("rejects duplicate buildingIds", () => {
    const entries: UnlockEntry[] = [
      { buildingId: "a", order: 1 },
      { buildingId: "a", order: 2 },
    ];
    const result = validateOrdering(entries);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.errors.some((e) => e.includes("duplicate buildingId"))).toBe(true);
  });

  it("rejects starting at order 2", () => {
    const entries: UnlockEntry[] = [{ buildingId: "a", order: 2 }];
    const result = validateOrdering(entries);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes("expected order 1"))).toBe(true);
  });
});

describe("buildingOrder", () => {
  const CHECKLIST: UnlockEntry[] = [
    { buildingId: "x", order: 1 },
    { buildingId: "y", order: 5 },
  ];

  it("returns the order for a known building", () => {
    expect(buildingOrder(CHECKLIST, "y")).toBe(5);
  });

  it("returns undefined for unknown building", () => {
    expect(buildingOrder(CHECKLIST, "z")).toBeUndefined();
  });
});

describe("comesBefore", () => {
  const CHECKLIST: UnlockEntry[] = [
    { buildingId: "a", order: 1 },
    { buildingId: "b", order: 2 },
    { buildingId: "c", order: 3 },
  ];

  it("returns true when a is before b", () => {
    expect(comesBefore(CHECKLIST, "a", "c")).toBe(true);
    expect(comesBefore(CHECKLIST, "a", "b")).toBe(true);
  });

  it("returns false when a is after b", () => {
    expect(comesBefore(CHECKLIST, "c", "a")).toBe(false);
  });

  it("returns false when either is unknown", () => {
    expect(comesBefore(CHECKLIST, "z", "a")).toBe(false);
    expect(comesBefore(CHECKLIST, "a", "z")).toBe(false);
  });
});
