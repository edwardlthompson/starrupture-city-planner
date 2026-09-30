import {
  type Building,
  type CityLayout,
  LAYOUT_SCHEMA_VERSION,
  type LayoutCell,
  type Result,
  type UnlockEntry,
} from "./types";

/** Runtime validation for JSON parsed from localStorage / import files (Sprint 1 row 1). */

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateBuilding(input: unknown): Result<Building> {
  if (!isObject(input)) return { ok: false, errors: ["building must be an object"] };
  const errors: string[] = [];
  const id = input.id;
  if (typeof id !== "string" || id.trim() === "")
    errors.push("building.id must be a non-empty string");
  const name = input.name;
  if (typeof name !== "string" || name.trim() === "")
    errors.push("building.name must be a non-empty string");
  const slotSpan = input.slotSpan;
  if (!isInteger(slotSpan) || slotSpan < 1)
    errors.push("building.slotSpan must be an integer >= 1");
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { id: id.trim(), name: name.trim(), slotSpan } };
}

export function validateUnlockEntry(input: unknown): Result<UnlockEntry> {
  if (!isObject(input)) return { ok: false, errors: ["unlock entry must be an object"] };
  const errors: string[] = [];
  if (typeof input.buildingId !== "string" || input.buildingId.trim() === "")
    errors.push("unlockEntry.buildingId must be a non-empty string");
  if (!isInteger(input.order) || input.order < 1)
    errors.push("unlockEntry.order must be an integer >= 1");
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { buildingId: input.buildingId.trim(), order: input.order } };
}

export function validateLayoutCell(input: unknown): Result<LayoutCell> {
  if (!isObject(input)) return { ok: false, errors: ["layout cell must be an object"] };
  const errors: string[] = [];
  if (!isInteger(input.slotIndex) || input.slotIndex < 0)
    errors.push("layoutCell.slotIndex must be an integer >= 0");
  const buildingId = input.buildingId;
  if (buildingId !== null && typeof buildingId !== "string")
    errors.push("layoutCell.buildingId must be a string or null");
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { slotIndex: input.slotIndex, buildingId } };
}

export function validateCityLayout(input: unknown): Result<CityLayout> {
  if (!isObject(input)) return { ok: false, errors: ["city layout must be an object"] };
  const errors: string[] = [];
  if (input.schemaVersion !== LAYOUT_SCHEMA_VERSION)
    errors.push(`cityLayout.schemaVersion must be ${LAYOUT_SCHEMA_VERSION}`);
  if (!isInteger(input.cityId) || input.cityId < 1)
    errors.push("cityLayout.cityId must be an integer >= 1");
  if (!Array.isArray(input.cells)) errors.push("cityLayout.cells must be an array");
  if (errors.length > 0) return { ok: false, errors };
  const cells: LayoutCell[] = [];
  const seen = new Set<number>();
  for (const [index, raw] of input.cells.entries()) {
    const cell = validateLayoutCell(raw);
    if (!cell.ok) {
      errors.push(`cityLayout.cells[${index}]: ${cell.errors.join(", ")}`);
      continue;
    }
    if (seen.has(cell.value.slotIndex))
      errors.push(`cityLayout.cells[${index}]: duplicate slotIndex ${cell.value.slotIndex}`);
    seen.add(cell.value.slotIndex);
    cells.push(cell.value);
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { schemaVersion: input.schemaVersion, cityId: input.cityId, cells } };
}
