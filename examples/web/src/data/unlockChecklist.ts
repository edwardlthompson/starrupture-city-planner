import type { UnlockEntry } from "../core/types";
import { STARRUPTURE_BUILDINGS } from "./buildings";

/**
 * StarRupture unlock checklist in West→East order (order 1 = Westernmost, unlocks first).
 *
 * PROVISIONAL DRAFT — pending the canonical order from the game (BUILD_PLAN.md
 * Sprint 1 row 4). `unlockChecklist.test.ts` enforces completeness, unique
 * orders, and referential integrity against `STARRUPTURE_BUILDINGS`.
 */
export const STARRUPTURE_UNLOCK_CHECKLIST: readonly UnlockEntry[] = STARRUPTURE_BUILDINGS.map(
  (building, index) => ({ buildingId: building.id, order: index + 1 }),
);
