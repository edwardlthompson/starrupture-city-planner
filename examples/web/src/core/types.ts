/** City-planner domain types (Sprint 1, ADR-0001 candidate). Pure data, no runtime deps. */

/** Validation result: a normalized value on success, or a human-readable error list. */
export type Result<T> = { ok: true; value: T } | { ok: false; errors: readonly string[] };

/** A placeable StarRupture building. `id` is kebab-case and stable across versions. */
export type Building = {
  readonly id: string;
  readonly name: string;
  /** Number of contiguous West→East strip slots the building occupies (≥1). */
  readonly slotSpan: number;
};

/** One row of the unlock checklist: a building in West→East unlock order. */
export type UnlockEntry = {
  readonly buildingId: string;
  /** 1-based West→East position; 1 unlocks first. */
  readonly order: number;
};

/** One cell of the West→East strip. `buildingId` is null when the slot is vacant. */
export type LayoutCell = {
  readonly slotIndex: number;
  readonly buildingId: string | null;
};

/** A planned city layout: the West→East strip plus the city it belongs to. */
export type CityLayout = {
  readonly schemaVersion: number;
  readonly cityId: number;
  readonly cells: readonly LayoutCell[];
};

/** Bumped whenever the persisted layout shape changes. */
export const LAYOUT_SCHEMA_VERSION = 1;
