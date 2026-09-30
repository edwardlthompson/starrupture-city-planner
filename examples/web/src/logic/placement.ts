import type { Building, CityLayout, LayoutCell, Result } from "../core/types";

/**
 * Placement rules for the West→East strip (Sprint 1 row 3).
 * Pure functions — no DOM, no side effects.
 */

/**
 * Checks whether `building` can be placed starting at `startSlot`.
 * Rules:
 *  - startSlot must be >= 0
 *  - the full span (startSlot .. startSlot+slotSpan-1) must fit within the strip
 *  - every slot in that range must currently be vacant (buildingId === null)
 */
export function canPlace(
  cells: readonly LayoutCell[],
  building: Building,
  startSlot: number,
): Result<void> {
  const errors: string[] = [];
  if (!Number.isInteger(startSlot) || startSlot < 0) {
    errors.push(`startSlot must be an integer >= 0, got ${startSlot}`);
  }
  const endSlot = startSlot + building.slotSpan - 1;
  if (endSlot >= cells.length) {
    errors.push(
      `building spans slots ${startSlot}..${endSlot} but strip has only ${cells.length} slots`,
    );
  }
  // Check that each slot in range is vacant
  if (errors.length === 0) {
    for (let i = startSlot; i <= endSlot; i++) {
      const cell = cells.find((c) => c.slotIndex === i);
      if (cell && cell.buildingId !== null) {
        errors.push(`slot ${i} is occupied by ${cell.buildingId}`);
        break;
      }
    }
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: undefined };
}

/**
 * Returns a new `LayoutCell[]` with `building` placed at `startSlot`,
 * or errors if placement is invalid.
 */
export function place(
  cells: readonly LayoutCell[],
  building: Building,
  startSlot: number,
): Result<LayoutCell[]> {
  const check = canPlace(cells, building, startSlot);
  if (!check.ok) return { ok: false, errors: check.errors };
  const next = cells.map((cell) => ({ ...cell }));
  for (let i = startSlot; i < startSlot + building.slotSpan; i++) {
    const idx = next.findIndex((c) => c.slotIndex === i);
    if (idx !== -1) {
      next[idx] = { slotIndex: i, buildingId: building.id };
    }
  }
  return { ok: true, value: next };
}

/**
 * Returns a new `LayoutCell[]` with the building at `startSlot` removed
 * (slots cleared to null). Errors if no building occupies that range.
 */
export function remove(
  cells: readonly LayoutCell[],
  startSlot: number,
  span: number,
): Result<LayoutCell[]> {
  const errors: string[] = [];
  let found = false;
  for (let i = startSlot; i < startSlot + span; i++) {
    const cell = cells.find((c) => c.slotIndex === i);
    if (cell && cell.buildingId !== null) found = true;
  }
  if (!found) {
    errors.push(`no building found at slot ${startSlot} with span ${span}`);
    return { ok: false, errors };
  }
  const next = cells.map((cell) => {
    if (cell.slotIndex >= startSlot && cell.slotIndex < startSlot + span) {
      return { slotIndex: cell.slotIndex, buildingId: null };
    }
    return { ...cell };
  });
  return { ok: true, value: next };
}

/**
 * Returns the list of building ids currently placed in the strip,
 * in West→East slot order.
 */
export function placedBuildings(cells: readonly LayoutCell[]): string[] {
  return [...cells]
    .sort((a, b) => a.slotIndex - b.slotIndex)
    .filter((c) => c.buildingId !== null)
    .map((c) => c.buildingId as string);
}

/**
 * Returns true when every slot in the strip is vacant.
 */
export function isEmptyStrip(cells: readonly LayoutCell[]): boolean {
  return cells.every((c) => c.buildingId === null);
}

/**
 * Validates a full CityLayout: every placed buildingId must exist in the catalog,
 * and no two buildings may overlap (contiguous spans are enforced by placement).
 */
export function validatePlacement(layout: CityLayout, catalogIds: readonly string[]): Result<void> {
  const errors: string[] = [];
  const catalogSet = new Set(catalogIds);
  const occupied = new Set<number>();
  for (const cell of layout.cells) {
    if (cell.buildingId === null) continue;
    if (!catalogSet.has(cell.buildingId)) {
      errors.push(`slot ${cell.slotIndex}: unknown building "${cell.buildingId}"`);
    }
    if (occupied.has(cell.slotIndex)) {
      errors.push(`slot ${cell.slotIndex}: double-occupied`);
    }
    occupied.add(cell.slotIndex);
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: undefined };
}
