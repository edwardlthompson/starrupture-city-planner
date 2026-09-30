import { describe, expect, it } from "vitest";
import type { Building, CityLayout, LayoutCell } from "../core/types";
import { LAYOUT_SCHEMA_VERSION } from "../core/types";
import {
  canPlace,
  isEmptyStrip,
  place,
  placedBuildings,
  remove,
  validatePlacement,
} from "./placement";

const REACTOR: Building = { id: "reactor", name: "Reactor", slotSpan: 2 };
const TURRET: Building = { id: "turret", name: "Turret", slotSpan: 1 };

function makeCells(count: number, occupied: Record<number, string> = {}): LayoutCell[] {
  return Array.from({ length: count }, (_, i) => ({
    slotIndex: i,
    buildingId: occupied[i] ?? null,
  }));
}

describe("canPlace", () => {
  it("accepts placement in an empty strip", () => {
    const cells = makeCells(5);
    const result = canPlace(cells, TURRET, 0);
    expect(result.ok).toBe(true);
  });

  it("rejects negative startSlot", () => {
    const result = canPlace(makeCells(5), TURRET, -1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes("startSlot"))).toBe(true);
  });

  it("rejects placement that exceeds strip length", () => {
    const cells = makeCells(3);
    const result = canPlace(cells, REACTOR, 2); // needs slots 2 and 3, but only 0-2 exist
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.errors.some((e) => e.includes("strip has only 3 slots"))).toBe(true);
  });

  it("rejects placement over an occupied slot", () => {
    const cells = makeCells(5, { 0: "turret" });
    const result = canPlace(cells, REACTOR, 0); // needs slots 0 and 1
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes("slot 0 is occupied"))).toBe(true);
  });

  it("accepts placement adjacent to occupied slots", () => {
    const cells = makeCells(5, { 0: "turret" });
    const result = canPlace(cells, REACTOR, 1); // slots 1 and 2
    expect(result.ok).toBe(true);
  });
});

describe("place", () => {
  it("returns updated cells with the building placed", () => {
    const cells = makeCells(4);
    const result = place(cells, REACTOR, 1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.find((c) => c.slotIndex === 1)?.buildingId).toBe("reactor");
      expect(result.value.find((c) => c.slotIndex === 2)?.buildingId).toBe("reactor");
      expect(result.value.find((c) => c.slotIndex === 0)?.buildingId).toBeNull();
      expect(result.value.find((c) => c.slotIndex === 3)?.buildingId).toBeNull();
    }
  });

  it("does not mutate the original cells", () => {
    const cells = makeCells(4);
    const original = JSON.parse(JSON.stringify(cells));
    place(cells, TURRET, 2);
    expect(cells).toEqual(original);
  });

  it("propagates errors from canPlace", () => {
    const cells = makeCells(2);
    const result = place(cells, REACTOR, 1); // needs slots 1 and 2, only 0-1 exist
    expect(result.ok).toBe(false);
  });
});

describe("remove", () => {
  it("clears the occupied slots", () => {
    const cells = makeCells(4, { 1: "reactor", 2: "reactor" });
    const result = remove(cells, 1, 2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.find((c) => c.slotIndex === 1)?.buildingId).toBeNull();
      expect(result.value.find((c) => c.slotIndex === 2)?.buildingId).toBeNull();
    }
  });

  it("errors when no building is at that location", () => {
    const cells = makeCells(4);
    const result = remove(cells, 1, 2);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes("no building found"))).toBe(true);
  });

  it("does not affect other occupied slots", () => {
    const cells = makeCells(6, { 0: "turret", 3: "reactor", 4: "reactor" });
    const result = remove(cells, 0, 1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.find((c) => c.slotIndex === 0)?.buildingId).toBeNull();
      expect(result.value.find((c) => c.slotIndex === 3)?.buildingId).toBe("reactor");
    }
  });
});

describe("placedBuildings", () => {
  it("returns building ids in slot order", () => {
    const cells = makeCells(5, { 0: "turret", 2: "reactor", 3: "reactor" });
    expect(placedBuildings(cells)).toEqual(["turret", "reactor", "reactor"]);
  });

  it("returns empty array for vacant strip", () => {
    expect(placedBuildings(makeCells(3))).toEqual([]);
  });
});

describe("isEmptyStrip", () => {
  it("returns true for fully vacant strip", () => {
    expect(isEmptyStrip(makeCells(4))).toBe(true);
  });

  it("returns false when any slot is occupied", () => {
    expect(isEmptyStrip(makeCells(4, { 2: "turret" }))).toBe(false);
  });
});

describe("validatePlacement", () => {
  it("accepts a valid layout with known buildings", () => {
    const layout: CityLayout = {
      schemaVersion: LAYOUT_SCHEMA_VERSION,
      cityId: 1,
      cells: makeCells(4, { 0: "turret", 1: "reactor", 2: "reactor" }),
    };
    const result = validatePlacement(layout, ["turret", "reactor"]);
    expect(result.ok).toBe(true);
  });

  it("rejects unknown building ids", () => {
    const layout: CityLayout = {
      schemaVersion: LAYOUT_SCHEMA_VERSION,
      cityId: 1,
      cells: makeCells(3, { 0: "unknown-building" }),
    };
    const result = validatePlacement(layout, ["turret"]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes("unknown building"))).toBe(true);
  });

  it("accepts an empty layout", () => {
    const layout: CityLayout = {
      schemaVersion: LAYOUT_SCHEMA_VERSION,
      cityId: 1,
      cells: makeCells(3),
    };
    expect(validatePlacement(layout, ["turret"]).ok).toBe(true);
  });
});
