import type { Result, UnlockEntry } from "../core/types";

/**
 * West→East ordering logic (Sprint 1 row 3).
 * Pure functions — no DOM, no side effects.
 */

/**
 * Returns a new array sorted by `order` ascending (stable for equal orders).
 */
export function sortByOrder(entries: readonly UnlockEntry[]): UnlockEntry[] {
  return [...entries].sort((a, b) => a.order - b.order);
}

/**
 * Validates that the checklist forms a contiguous 1..N sequence with
 * no gaps and no duplicate orders. Returns sorted entries on success.
 */
export function validateOrdering(entries: readonly UnlockEntry[]): Result<UnlockEntry[]> {
  if (entries.length === 0) {
    return { ok: false, errors: ["checklist must not be empty"] };
  }
  const sorted = sortByOrder(entries);
  const errors: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const expected = i + 1;
    const actual = sorted[i].order;
    if (actual !== expected) {
      errors.push(`expected order ${expected} at index ${i}, found ${actual}`);
      if (errors.length >= 5) break; // cap error list
    }
  }
  // Also check for duplicate buildingIds
  const ids = new Set<string>();
  for (const entry of sorted) {
    if (ids.has(entry.buildingId)) {
      errors.push(`duplicate buildingId: ${entry.buildingId}`);
    }
    ids.add(entry.buildingId);
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: sorted };
}

/**
 * Returns the West→East order for a given building, or undefined if absent.
 */
export function buildingOrder(
  checklist: readonly UnlockEntry[],
  buildingId: string,
): number | undefined {
  return checklist.find((e) => e.buildingId === buildingId)?.order;
}

/**
 * Returns true when building `a` comes before building `b` in West→East order.
 * If either is absent, returns false.
 */
export function comesBefore(checklist: readonly UnlockEntry[], a: string, b: string): boolean {
  const orderA = buildingOrder(checklist, a);
  const orderB = buildingOrder(checklist, b);
  if (orderA === undefined || orderB === undefined) return false;
  return orderA < orderB;
}
