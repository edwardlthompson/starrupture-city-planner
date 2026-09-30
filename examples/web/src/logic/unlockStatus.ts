import type { UnlockEntry } from "../core/types";

/**
 * Pure unlock-status logic (Sprint 1 row 3).
 * No DOM, no side effects — safe in any environment.
 */

/**
 * Returns true when the building with `buildingId` is unlocked
 * (its West→East order ≤ `highestUnlockedOrder`).
 */
export function isUnlocked(
  checklist: readonly UnlockEntry[],
  buildingId: string,
  highestUnlockedOrder: number,
): boolean {
  const entry = checklist.find((e) => e.buildingId === buildingId);
  if (!entry) return false;
  return entry.order <= highestUnlockedOrder;
}

/**
 * Returns all checklist entries whose order is ≤ `highestUnlockedOrder`,
 * sorted by order ascending.
 */
export function unlockedEntries(
  checklist: readonly UnlockEntry[],
  highestUnlockedOrder: number,
): readonly UnlockEntry[] {
  return checklist.filter((e) => e.order <= highestUnlockedOrder).sort((a, b) => a.order - b.order);
}

/**
 * Returns the next building to unlock (order = highestUnlockedOrder + 1),
 * or undefined when everything is already unlocked.
 */
export function nextToUnlock(
  checklist: readonly UnlockEntry[],
  highestUnlockedOrder: number,
): UnlockEntry | undefined {
  return checklist.find((e) => e.order === highestUnlockedOrder + 1);
}

/**
 * Returns the count of buildings already unlocked (order ≤ highestUnlockedOrder).
 */
export function unlockedCount(
  checklist: readonly UnlockEntry[],
  highestUnlockedOrder: number,
): number {
  return checklist.filter((e) => e.order <= highestUnlockedOrder).length;
}
