/**
 * Drag/drop placement state & collision rules for the layout board.
 * Pure functions — no DOM, no side effects.
 */
import type { Building, LayoutCell, Result } from "../../core/types";
import { canPlaceAt, emptyCells, GRID_SLOTS, nearestLegalSlot, slotRange } from "../grid/index";

/** State of an active drag operation. */
export type DragState = {
  buildingId: string;
  /** The slot the building is currently snapped to. */
  currentSlot: number;
};

/**
 * Attempts to place a building at the given slot.
 * Returns the new cells on success, or an error list.
 */
export function dropBuilding(
  cells: readonly LayoutCell[],
  building: Building,
  slot: number,
): Result<LayoutCell[]> {
  if (!canPlaceAt(cells, building, slot)) {
    return { ok: false, errors: [`Cannot place "${building.name}" at slot ${slot}`] };
  }
  const next = cells.map((c) => ({ ...c }));
  for (const s of slotRange(slot, building.slotSpan)) {
    const idx = next.findIndex((c) => c.slotIndex === s);
    if (idx !== -1) next[idx] = { slotIndex: s, buildingId: building.id };
  }
  return { ok: true, value: next };
}

/**
 * Removes the building occupying `slot` (if any).
 * `span` is how many slots to clear.
 * Returns error if the slot is not occupied.
 */
export function removeAt(
  cells: readonly LayoutCell[],
  slot: number,
  span: number,
): Result<LayoutCell[]> {
  const first = cells.find((c) => c.slotIndex === slot);
  if (!first || first.buildingId === null) {
    return { ok: false, errors: [`Slot ${slot} is vacant`] };
  }
  const next = cells.map((c) => ({ ...c }));
  for (const s of slotRange(slot, span)) {
    const idx = next.findIndex((c) => c.slotIndex === s);
    if (idx !== -1) next[idx] = { slotIndex: s, buildingId: null };
  }
  return { ok: true, value: next };
}

/**
 * Computes the best slot to snap a dragging building to.
 * - `rawSlot` is the snapped pointer position.
 * - Returns the nearest legal slot where the building would fit AND be vacant.
 * - If no position works, returns -1.
 */
export function findDropSlot(
  cells: readonly LayoutCell[],
  building: Building,
  rawSlot: number,
): number {
  // First try the raw position (clamped)
  const clamped = nearestLegalSlot(rawSlot, building.slotSpan);
  if (clamped === -1) return -1;
  if (canPlaceAt(cells, building, clamped)) return clamped;

  // Search outward from the preferred slot
  const maxStart = GRID_SLOTS - building.slotSpan;
  for (let offset = 1; offset <= maxStart; offset++) {
    const left = clamped - offset;
    if (left >= 0 && canPlaceAt(cells, building, left)) return left;
    const right = clamped + offset;
    if (right <= maxStart && canPlaceAt(cells, building, right)) return right;
  }
  return -1;
}

/**
 * Returns the building ID at a slot, or null if vacant.
 */
export function buildingAtSlot(cells: readonly LayoutCell[], slot: number): string | null {
  return cells.find((c) => c.slotIndex === slot)?.buildingId ?? null;
}

/**
 * Finds the start slot of a building by ID (first occurrence).
 * Returns -1 if not found.
 */
export function findBuildingStart(cells: readonly LayoutCell[], buildingId: string): number {
  const idx = cells.findIndex((c) => c.buildingId === buildingId);
  return idx === -1 ? -1 : cells[idx].slotIndex;
}

/**
 * Creates a fresh empty board state.
 */
export function createEmptyBoard(): LayoutCell[] {
  return emptyCells();
}

/**
 * Validates an entire board: no building extends past grid,
 * no duplicate building IDs in overlapping slots.
 */
export function validateBoard(cells: readonly LayoutCell[]): Result<void> {
  const errors: string[] = [];
  for (const cell of cells) {
    if (cell.slotIndex < 0 || cell.slotIndex >= GRID_SLOTS) {
      errors.push(`Slot ${cell.slotIndex} is out of range`);
    }
  }
  // Check for slot index uniqueness
  const seen = new Set<number>();
  for (const cell of cells) {
    if (seen.has(cell.slotIndex)) {
      errors.push(`Duplicate slot ${cell.slotIndex}`);
    }
    seen.add(cell.slotIndex);
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: undefined };
}