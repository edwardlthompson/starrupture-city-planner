import { describe, expect, it } from "vitest";
import { validateUnlockEntry } from "../core/validate";
import { validateOrdering } from "../logic/ordering";
import { STARRUPTURE_BUILDINGS } from "./buildings";
import { STARRUPTURE_UNLOCK_CHECKLIST } from "./unlockChecklist";

describe("STARRUPTURE_UNLOCK_CHECKLIST", () => {
  it("covers every building in the catalog", () => {
    const checklistIds = new Set(STARRUPTURE_UNLOCK_CHECKLIST.map((e) => e.buildingId));
    const catalogIds = new Set(STARRUPTURE_BUILDINGS.map((b) => b.id));
    expect(checklistIds).toEqual(catalogIds);
  });

  it("has the same length as the catalog", () => {
    expect(STARRUPTURE_UNLOCK_CHECKLIST.length).toBe(STARRUPTURE_BUILDINGS.length);
  });

  it("every entry passes validateUnlockEntry", () => {
    for (const entry of STARRUPTURE_UNLOCK_CHECKLIST) {
      const result = validateUnlockEntry(entry);
      expect(result, `entry ${JSON.stringify(entry)} failed`).toMatchObject({ ok: true });
    }
  });

  it("forms a contiguous 1..N order (validateOrdering passes)", () => {
    const result = validateOrdering(STARRUPTURE_UNLOCK_CHECKLIST);
    expect(
      result,
      `ordering invalid: ${JSON.stringify((result as { errors: string[] }).errors)}`,
    ).toMatchObject({ ok: true });
  });

  it("orders are 1-based and sequential", () => {
    const sorted = [...STARRUPTURE_UNLOCK_CHECKLIST].sort((a, b) => a.order - b.order);
    sorted.forEach((entry, i) => {
      expect(entry.order).toBe(i + 1);
    });
  });
});
