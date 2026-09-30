import { describe, it, expect } from "vitest";
import type { Building, LayoutCell } from "../../core/types";
import {
  dropBuilding,
  removeAt,
  findDropSlot,
  buildingAtSlot,
  findBuildingStart,
  createEmptyBoard,
  validateBoard,
} from "./index";
import { GRID_SLOTS } from "../grid/index";

const single: Building = { id: "a", name: "Single", slotSpan: 1 };
const wide: Building = { id: "w", name: "Wide", slotSpan: 2 };

describe("dnd placement", () => {
  it("dropBuilding places a building on an empty board", () => {
    const cells = createEmptyBoard();
    const result = dropBuilding(cells, single, 5);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[5].buildingId).toBe("a");
      expect(result.value[0].buildingId).toBeNull();
    }
  });

  it("dropBuilding places a multi-slot building", () => {
    const cells = createEmptyBoard();
    const result = dropBuilding(cells, wide, 10);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[10].buildingId).toBe("w");
      expect(result.value[11].buildingId).toBe("w");
      expect(result.value[9].buildingId).toBeNull();
    }
  });

  it("dropBuilding rejects out-of-bounds", () => {
    const cells = createEmptyBoard();
    const result = dropBuilding(cells, wide, GRID_SLOTS - 1);
    expect(result.ok).toBe(false);
  });

  it("dropBuilding rejects overlapping placement", () => {
    const cells = createEmptyBoard();
    const placed = dropBuilding(cells, wide, 5);
    if (!placed.ok) throw new Error("expected ok");
    const conflict = dropBuilding(placed.value, single, 6);
    expect(conflict.ok).toBe(false);
  });

  it("removeAt clears a building", () => {
    let cells = createEmptyBoard();
    const placed = dropBuilding(cells, wide, 3);
    if (!placed.ok) throw new Error("expected ok");
    cells = placed.value;
    expect(buildingAtSlot(cells, 3)).toBe("w");
    expect(buildingAtSlot(cells, 4)).toBe("w");

    const removed = removeAt(cells, 3, 2);
    expect(removed.ok).toBe(true);
    if (removed.ok) {
      expect(buildingAtSlot(removed.value, 3)).toBeNull();
      expect(buildingAtSlot(removed.value, 4)).toBeNull();
    }
  });

  it("removeAt errors on vacant slot", () => {
    const cells = createEmptyBoard();
    const result = removeAt(cells, 0, 1);
    expect(result.ok).toBe(false);
  });

  it("findDropSlot returns the raw slot when legal", () => {
    const cells = createEmptyBoard();
    expect(findDropSlot(cells, single, 10)).toBe(10);
  });

  it("findDropSlot finds nearest legal slot when target is occupied", () => {
    let cells = createEmptyBoard();
    const placed = dropBuilding(cells, single, 10);
    if (!placed.ok) throw new Error("expected ok");
    cells = placed.value;
    // slot 10 occupied, so find nearest
    const slot = findDropSlot(cells, single, 10);
    expect(slot).not.toBe(-1);
    expect(slot).not.toBe(10);
  });

  it("findDropSlot returns -1 when board is full", () => {
    const cells: LayoutCell[] = Array.from({ length: GRID_SLOTS }, (_, i) => ({
      slotIndex: i,
      buildingId: "full",
    }));
    expect(findDropSlot(cells, single, 0)).toBe(-1);
  });

  it("buildingAtSlot returns building id or null", () => {
    const cells = createEmptyBoard();
    expect(buildingAtSlot(cells, 0)).toBeNull();
    const placed = dropBuilding(cells, single, 3);
    if (placed.ok) {
      expect(buildingAtSlot(placed.value, 3)).toBe("a");
    }
  });

  it("findBuildingStart finds the start slot", () => {
    let cells = createEmptyBoard();
    const placed = dropBuilding(cells, wide, 7);
    if (!placed.ok) throw new Error("expected ok");
    cells = placed.value;
    expect(findBuildingStart(cells, "w")).toBe(7);
    expect(findBuildingStart(cells, "nonexistent")).toBe(-1);
  });

  it("validateBoard passes for empty board", () => {
    const cells = createEmptyBoard();
    expect(validateBoard(cells).ok).toBe(true);
  });

  it("validateBoard rejects duplicate slots", () => {
    const cells: LayoutCell[] = [
      { slotIndex: 0, buildingId: null },
      { slotIndex: 0, buildingId: "a" },
    ];
    expect(validateBoard(cells).ok).toBe(false);
  });

  it("validateBoard rejects out-of-range slots", () => {
    const cells: LayoutCell[] = [{ slotIndex: 99, buildingId: null }];
    expect(validateBoard(cells).ok).toBe(false);
  });
});