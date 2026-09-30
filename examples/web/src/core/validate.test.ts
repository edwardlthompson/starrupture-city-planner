import { describe, expect, it } from "vitest";
import { LAYOUT_SCHEMA_VERSION } from "./types";
import {
  validateBuilding,
  validateCityLayout,
  validateLayoutCell,
  validateUnlockEntry,
} from "./validate";

describe("validateBuilding", () => {
  it("accepts a valid building", () => {
    const result = validateBuilding({ id: "reactor", name: "Reactor", slotSpan: 2 });
    expect(result).toEqual({ ok: true, value: { id: "reactor", name: "Reactor", slotSpan: 2 } });
  });

  it("trims whitespace on id and name", () => {
    const result = validateBuilding({ id: "  reactor  ", name: "  Reactor  ", slotSpan: 1 });
    expect(result).toEqual({ ok: true, value: { id: "reactor", name: "Reactor", slotSpan: 1 } });
  });

  it("rejects non-object input", () => {
    expect(validateBuilding(null).ok).toBe(false);
    expect(validateBuilding("string").ok).toBe(false);
    expect(validateBuilding(42).ok).toBe(false);
  });

  it("rejects missing or empty id", () => {
    const result = validateBuilding({ id: "", name: "X", slotSpan: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain("building.id must be a non-empty string");
  });

  it("rejects missing name", () => {
    const result = validateBuilding({ id: "a", slotSpan: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain("building.name must be a non-empty string");
  });

  it("rejects slotSpan < 1 or non-integer", () => {
    expect(validateBuilding({ id: "a", name: "A", slotSpan: 0 }).ok).toBe(false);
    expect(validateBuilding({ id: "a", name: "A", slotSpan: 1.5 }).ok).toBe(false);
    expect(validateBuilding({ id: "a", name: "A", slotSpan: "2" }).ok).toBe(false);
  });

  it("accumulates multiple errors", () => {
    const result = validateBuilding({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("validateUnlockEntry", () => {
  it("accepts a valid entry", () => {
    const result = validateUnlockEntry({ buildingId: "reactor", order: 3 });
    expect(result).toEqual({ ok: true, value: { buildingId: "reactor", order: 3 } });
  });

  it("rejects order < 1", () => {
    const result = validateUnlockEntry({ buildingId: "a", order: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain("unlockEntry.order must be an integer >= 1");
  });

  it("rejects non-string buildingId", () => {
    const result = validateUnlockEntry({ buildingId: 123, order: 1 });
    expect(result.ok).toBe(false);
  });
});

describe("validateLayoutCell", () => {
  it("accepts a vacant cell", () => {
    const result = validateLayoutCell({ slotIndex: 0, buildingId: null });
    expect(result).toEqual({ ok: true, value: { slotIndex: 0, buildingId: null } });
  });

  it("accepts an occupied cell", () => {
    const result = validateLayoutCell({ slotIndex: 1, buildingId: "reactor" });
    expect(result).toEqual({ ok: true, value: { slotIndex: 1, buildingId: "reactor" } });
  });

  it("rejects negative slotIndex", () => {
    const result = validateLayoutCell({ slotIndex: -1, buildingId: null });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain("layoutCell.slotIndex must be an integer >= 0");
  });

  it("rejects non-string non-null buildingId", () => {
    const result = validateLayoutCell({ slotIndex: 0, buildingId: 42 });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.errors).toContain("layoutCell.buildingId must be a string or null");
  });
});

describe("validateCityLayout", () => {
  it("accepts a valid layout", () => {
    const input = {
      schemaVersion: LAYOUT_SCHEMA_VERSION,
      cityId: 1,
      cells: [
        { slotIndex: 0, buildingId: null },
        { slotIndex: 1, buildingId: "reactor" },
      ],
    };
    const result = validateCityLayout(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.cityId).toBe(1);
      expect(result.value.cells).toHaveLength(2);
    }
  });

  it("rejects wrong schemaVersion", () => {
    const result = validateCityLayout({
      schemaVersion: 999,
      cityId: 1,
      cells: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.errors).toContain(`cityLayout.schemaVersion must be ${LAYOUT_SCHEMA_VERSION}`);
  });

  it("rejects duplicate slotIndex", () => {
    const result = validateCityLayout({
      schemaVersion: LAYOUT_SCHEMA_VERSION,
      cityId: 1,
      cells: [
        { slotIndex: 0, buildingId: null },
        { slotIndex: 0, buildingId: "a" },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.errors.some((e: string) => e.includes("duplicate slotIndex 0"))).toBe(true);
  });

  it("rejects non-array cells", () => {
    const result = validateCityLayout({
      schemaVersion: LAYOUT_SCHEMA_VERSION,
      cityId: 1,
      cells: "nope",
    });
    expect(result.ok).toBe(false);
  });
});
