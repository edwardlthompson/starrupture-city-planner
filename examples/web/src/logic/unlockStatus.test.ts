import { describe, expect, it } from "vitest";
import type { UnlockEntry } from "../core/types";
import { isUnlocked, nextToUnlock, unlockedCount, unlockedEntries } from "./unlockStatus";

const CHECKLIST: readonly UnlockEntry[] = [
  { buildingId: "a", order: 1 },
  { buildingId: "b", order: 2 },
  { buildingId: "c", order: 3 },
  { buildingId: "d", order: 4 },
];

describe("isUnlocked", () => {
  it("returns true when order <= highestUnlockedOrder", () => {
    expect(isUnlocked(CHECKLIST, "a", 1)).toBe(true);
    expect(isUnlocked(CHECKLIST, "a", 3)).toBe(true);
  });

  it("returns false when order > highestUnlockedOrder", () => {
    expect(isUnlocked(CHECKLIST, "d", 3)).toBe(false);
    expect(isUnlocked(CHECKLIST, "b", 1)).toBe(false);
  });

  it("returns false for unknown building", () => {
    expect(isUnlocked(CHECKLIST, "unknown", 99)).toBe(false);
  });

  it("returns false when nothing is unlocked (highestUnlockedOrder=0)", () => {
    expect(isUnlocked(CHECKLIST, "a", 0)).toBe(false);
  });
});

describe("unlockedEntries", () => {
  it("returns entries up to and including highestUnlockedOrder", () => {
    const result = unlockedEntries(CHECKLIST, 2);
    expect(result.map((e) => e.buildingId)).toEqual(["a", "b"]);
  });

  it("returns all when everything is unlocked", () => {
    const result = unlockedEntries(CHECKLIST, 10);
    expect(result).toHaveLength(4);
  });

  it("returns empty when nothing is unlocked", () => {
    expect(unlockedEntries(CHECKLIST, 0)).toHaveLength(0);
  });

  it("is sorted by order ascending", () => {
    const shuffled = [
      { buildingId: "c", order: 3 },
      { buildingId: "a", order: 1 },
      { buildingId: "b", order: 2 },
    ];
    const result = unlockedEntries(shuffled, 3);
    expect(result.map((e) => e.order)).toEqual([1, 2, 3]);
  });
});

describe("nextToUnlock", () => {
  it("returns the entry at order = highestUnlockedOrder + 1", () => {
    expect(nextToUnlock(CHECKLIST, 2)?.buildingId).toBe("c");
  });

  it("returns undefined when all are unlocked", () => {
    expect(nextToUnlock(CHECKLIST, 4)).toBeUndefined();
    expect(nextToUnlock(CHECKLIST, 99)).toBeUndefined();
  });

  it("returns the first entry when nothing is unlocked", () => {
    expect(nextToUnlock(CHECKLIST, 0)?.buildingId).toBe("a");
  });
});

describe("unlockedCount", () => {
  it("counts correctly", () => {
    expect(unlockedCount(CHECKLIST, 0)).toBe(0);
    expect(unlockedCount(CHECKLIST, 1)).toBe(1);
    expect(unlockedCount(CHECKLIST, 3)).toBe(3);
    expect(unlockedCount(CHECKLIST, 4)).toBe(4);
    expect(unlockedCount(CHECKLIST, 99)).toBe(4);
  });
});
