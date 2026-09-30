import { describe, expect, it } from "vitest";
import { validateBuilding } from "../core/validate";
import { buildingById, STARRUPTURE_BUILDINGS } from "./buildings";

describe("STARRUPTURE_BUILDINGS catalog", () => {
  it("is non-empty", () => {
    expect(STARRUPTURE_BUILDINGS.length).toBeGreaterThan(0);
  });

  it("every entry passes validateBuilding", () => {
    for (const building of STARRUPTURE_BUILDINGS) {
      const result = validateBuilding(building);
      expect(result, `building "${building.id}" failed validation`).toMatchObject({ ok: true });
    }
  });

  it("has unique building ids", () => {
    const ids = STARRUPTURE_BUILDINGS.map((b) => b.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("has unique building names", () => {
    const names = STARRUPTURE_BUILDINGS.map((b) => b.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("all slotSpan values are positive integers", () => {
    for (const b of STARRUPTURE_BUILDINGS) {
      expect(b.slotSpan).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(b.slotSpan)).toBe(true);
    }
  });
});

describe("buildingById", () => {
  it("finds an existing building", () => {
    const found = buildingById(STARRUPTURE_BUILDINGS, "reactor");
    expect(found?.name).toBe("Reactor");
  });

  it("returns undefined for unknown id", () => {
    expect(buildingById(STARRUPTURE_BUILDINGS, "nonexistent")).toBeUndefined();
  });

  it("does not match partial ids", () => {
    expect(buildingById(STARRUPTURE_BUILDINGS, "react")).toBeUndefined();
  });
});
