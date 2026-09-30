import { describe, it, expect } from "vitest";
import type { Building, LayoutCell } from "../../core/types";
import {
  GRID_SLOTS,
  slotRange,
  fitsInGrid,
  isRangeVacant,
  snapToSlot,
  nearestLegalSlot,
  emptyCells,
  canPlaceAt,
} from "./index";

const small: Building = { id: "test", name: "Test", slotSpan: 1 };
const wide: Building = { id: "wide", name: "Wide", slotSpan: 3 };

describe("grid geometry", () => {
  it("slotRange returns the correct indices", () => {
    expect(slotRange(0, 3)).toEqual([0, 1, 2]);
    expect(slotRange(5, 2)).toEqual([5, 6]);
    expect(slotRange(10, 1)).toEqual([10]);
  });

  it("fitsInGrid rejects negative start", () => {
    expect(fitsInGrid(-1, 1)).toBe(false);
  });

  it("fitsInGrid rejects overflow at end", () => {
    expect(fitsInGrid(GRID_SLOTS - 1, 2)).toBe(false);
    expect(fitsInGrid(GRID_SLOTS, 1)).toBe(false);
  });

  it("fitsInGrid accepts valid positions", () => {
    expect(fitsInGrid(0, 1)).toBe(true);
    expect(fitsInGrid(GRID_SLOTS - 1, 1)).toBe(true);
    expect(fitsInGrid(2, 3)).toBe(true);
  });

  it("isRangeVacant returns true for empty grid", () => {
    const cells = emptyCells();
    expect(isRangeVacant(cells, 0, 3)).toBe(true);
    expect(isRangeVacant(cells, 20, 4)).toBe(true);
  });

  it("isRangeVacant returns false when occupied", () => {
    const cells: LayoutCell[] = emptyCells();
    cells[5] = { slotIndex: 5, buildingId: "occupied" };
    expect(isRangeVacant(cells, 4, 3)).toBe(false);
    expect(isRangeVacant(cells, 6, 2)).toBe(true);
  });

  it("snapToSlot maps pixel to nearest slot", () => {
    const rect = { left: 0, width: 240 }; // 10px per slot
    expect(snapToSlot(0, rect)).toBe(0);
    expect(snapToSlot(5, rect)).toBe(1);
    expect(snapToSlot(15, rect)).toBe(2);
    expect(snapToSlot(115, rect)).toBe(12);
    expect(snapToSlot(239, rect)).toBe(23);
  });

  it("snapToSlot clamps to grid bounds", () => {
    const rect = { left: 100, width: 240 };
    expect(snapToSlot(0, rect)).toBe(0);
    expect(snapToSlot(500, rect)).toBe(GRID_SLOTS - 1);
  });

  it("nearestLegalSlot clamps to valid range", () => {
    expect(nearestLegalSlot(-5, 2)).toBe(0);
    expect(nearestLegalSlot(100, 2)).toBe(GRID_SLOTS - 2);
    expect(nearestLegalSlot(10, 2)).toBe(10);
  });

  it("nearestLegalSlot returns -1 if building is wider than grid", () => {
    expect(nearestLegalSlot(0, GRID_SLOTS + 1)).toBe(-1);
  });

  it("emptyCells creates correct number of vacant cells", () => {
    const cells = emptyCells();
    expect(cells).toHaveLength(GRID_SLOTS);
    expect(cells.every((c) => c.buildingId === null)).toBe(true);
    expect(cells[0].slotIndex).toBe(0);
    expect(cells[23].slotIndex).toBe(23);
  });

  it("canPlaceAt validates placement", () => {
    const cells = emptyCells();
    expect(canPlaceAt(cells, small, 0)).toBe(true);
    expect(canPlaceAt(cells, small, GRID_SLOTS - 1)).toBe(true);
    expect(canPlaceAt(cells, wide, GRID_SLOTS - 1)).toBe(false); // overflow
  });

  it("canPlaceAt rejects occupied range", () => {
    const cells: LayoutCell[] = emptyCells();
    cells[2] = { slotIndex: 2, buildingId: "x" };
    expect(canPlaceAt(cells, small, 2)).toBe(false);
    expect(canPlaceAt(cells, small, 3)).toBe(true);
  });
});