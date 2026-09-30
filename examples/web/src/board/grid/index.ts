/**
 * Grid geometry & snap-to-grid math for the West→East strip.
 * Pure functions — no DOM, no side effects.
 */
import type { Building, LayoutCell } from "../../core/types";

/** Total number of slots in the West→East strip. */
export const GRID_SLOTS = 24;

/** Minimum pixel width of one slot in the rendered board. */
export const SLOT_MIN_PX = 32;

/**
 * Returns the inclusive list of slot indices occupied by a building
 * placed at `startSlot` with the given `span`.
 */
export function slotRange(startSlot: number, span: number): readonly number[] {
  const out: number[] = [];
  for (let i = 0; i < span; i++) out.push(startSlot + i);
  return out;
}

/**
 * Checks whether a building of `span` slots fits entirely within
 * the `totalSlots` grid when placed at `startSlot`.
 */
export function fitsInGrid(startSlot: number, span: number, totalSlots: number = GRID_SLOTS): boolean {
  if (startSlot < 0) return false;
  if (startSlot + span > totalSlots) return false;
  return true;
}

/**
 * Checks whether every slot in the range [startSlot, startSlot+span) is
 * currently vacant (buildingId === null) in the given layout.
 */
export function isRangeVacant(cells: readonly LayoutCell[], startSlot: number, span: number): boolean {
  for (const slot of slotRange(startSlot, span)) {
    const cell = cells.find((c) => c.slotIndex === slot);
    if (cell && cell.buildingId !== null) return false;
  }
  return true;
}

/**
 * Given a pointer position (`clientX`) and the board element's bounding rect,
 * compute the nearest slot index. The result is clamped to [0, GRID_SLOTS - 1].
 *
 * `slotWidth` is the computed pixel width of each slot (rect.width / GRID_SLOTS).
 */
export function snapToSlot(clientX: number, boardRect: { left: number; width: number }, slotWidth?: number): number {
  const sw = slotWidth ?? boardRect.width / GRID_SLOTS;
  const relativeX = clientX - boardRect.left;
  const rawSlot = Math.round(relativeX / sw);
  return Math.max(0, Math.min(GRID_SLOTS - 1, rawSlot));
}

/**
 * Returns the best legal start slot for dragging a `building` near `rawSlot`.
 * - If the raw slot is within bounds and the full span fits, returns rawSlot.
 * - Otherwise tries to shift the building so it fits (prefers keeping the
 *   left edge as close to rawSlot as possible).
 * - Returns -1 if no valid position exists.
 */
export function nearestLegalSlot(rawSlot: number, span: number, totalSlots: number = GRID_SLOTS): number {
  if (span > totalSlots) return -1;
  const maxStart = totalSlots - span;
  if (rawSlot < 0) return 0;
  if (rawSlot > maxStart) return maxStart;
  return rawSlot;
}

/**
 * Creates an empty grid of `totalSlots` cells (all vacant).
 */
export function emptyCells(totalSlots: number = GRID_SLOTS): LayoutCell[] {
  return Array.from({ length: totalSlots }, (_, i) => ({ slotIndex: i, buildingId: null }));
}

/**
 * Validates that a building can be placed at `startSlot` on the given cells:
 * must fit in grid AND range must be vacant.
 */
export function canPlaceAt(cells: readonly LayoutCell[], building: Building, startSlot: number, totalSlots: number = GRID_SLOTS): boolean {
  if (!fitsInGrid(startSlot, building.slotSpan, totalSlots)) return false;
  if (!isRangeVacant(cells, startSlot, building.slotSpan)) return false;
  return true;
}