import {
  type Building,
  type CityLayout,
  LAYOUT_SCHEMA_VERSION,
  type LayoutCell,
  type Result,
  type UnlockEntry,
} from "./types";

/** Runtime validation for JSON parsed from localStorage / import files (Sprint 1 row 1). */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateBuilding(input: unknown): Result<Building> {
  if (!isPlainObject(input)) return { ok: false, errors: ["building must be an object"] };
  const errors: string[] = [];
  const rawId: unknown = input.id;
  const id = typeof rawId === "string" ? rawId : null;
  if (id === null || id.trim() === "") errors.push("building.id must be a non-empty string");
  const rawName: unknown = input.name;
  const name = typeof rawName === "string" ? rawName : null;
  if (name === null || name.trim() === "") errors.push("building.name must be a non-empty string");
  const rawSpan: unknown = input.slotSpan;
  const slotSpan = typeof rawSpan === "number" ? rawSpan : null;
  if (slotSpan === null || !Number.isInteger(slotSpan) || slotSpan < 1)
    errors.push("building.slotSpan must be an integer >= 1");
  if (errors.length > 0 || id === null || name === null || slotSpan === null)
    return { ok: false, errors };
  return { ok: true, value: { id: id.trim(), name: name.trim(), slotSpan } };
}

export function validateUnlockEntry(input: unknown): Result<UnlockEntry> {
  if (!isPlainObject(input)) return { ok: false, errors: ["unlock entry must be an object"] };
  const errors: string[] = [];
  const rawId: unknown = input.buildingId;
  const buildingId = typeof rawId === "string" ? rawId : null;
  if (buildingId === null || buildingId.trim() === "")
    errors.push("unlockEntry.buildingId must be a non-empty string");
  const rawOrder: unknown = input.order;
  const order = typeof rawOrder === "number" ? rawOrder : null;
  if (order === null || !Number.isInteger(order) || order < 1)
    errors.push("unlockEntry.order must be an integer >= 1");
  if (errors.length > 0 || buildingId === null || order === null) return { ok: false, errors };
  return { ok: true, value: { buildingId: buildingId.trim(), order } };
}

export function validateLayoutCell(input: unknown): Result<LayoutCell> {
  if (!isPlainObject(input)) return { ok: false, errors: ["layout cell must be an object"] };
  const errors: string[] = [];
  const rawSlot: unknown = input.slotIndex;
  const slotIndex = typeof rawSlot === "number" ? rawSlot : null;
  if (slotIndex === null || !Number.isInteger(slotIndex) || slotIndex < 0)
    errors.push("layoutCell.slotIndex must be an integer >= 0");
  const rawBuildingId: unknown = input.buildingId;
  const buildingId =
    rawBuildingId === null ? null : typeof rawBuildingId === "string" ? rawBuildingId : null;
  if (buildingId === null && rawBuildingId !== null)
    errors.push("layoutCell.buildingId must be a string or null");
  if (errors.length > 0 || slotIndex === null) return { ok: false, errors };
  return {
    ok: true,
    value: { slotIndex, buildingId: rawBuildingId === null ? null : buildingId },
  };
}

function parseCells(rawCells: unknown): { cells: LayoutCell[] | null; errors: string[] } {
  if (!Array.isArray(rawCells))
    return { cells: null, errors: ["cityLayout.cells must be an array"] };
  const cells: LayoutCell[] = [];
  const errors: string[] = [];
  const seen = new Set<number>();
  rawCells.forEach((raw, index) => {
    const cell = validateLayoutCell(raw);
    if (!cell.ok) {
      errors.push(`cityLayout.cells[${index}]: ${cell.errors.join(", ")}`);
      return;
    }
    if (seen.has(cell.value.slotIndex)) {
      errors.push(`cityLayout.cells[${index}]: duplicate slotIndex ${cell.value.slotIndex}`);
      return;
    }
    seen.add(cell.value.slotIndex);
    cells.push(cell.value);
  });
  return { cells: errors.length > 0 ? null : cells, errors };
}

export function validateCityLayout(input: unknown): Result<CityLayout> {
  if (!isPlainObject(input)) return { ok: false, errors: ["city layout must be an object"] };
  const errors: string[] = [];
  const rawSchema: unknown = input.schemaVersion;
  if (rawSchema !== LAYOUT_SCHEMA_VERSION)
    errors.push(`cityLayout.schemaVersion must be ${LAYOUT_SCHEMA_VERSION}`);
  const rawCityId: unknown = input.cityId;
  const cityId = typeof rawCityId === "number" ? rawCityId : null;
  if (cityId === null || !Number.isInteger(cityId) || cityId < 1)
    errors.push("cityLayout.cityId must be an integer >= 1");
  const { cells, errors: cellErrors } = parseCells(input.cells);
  errors.push(...cellErrors);
  if (errors.length > 0 || cityId === null || cells === null) return { ok: false, errors };
  return { ok: true, value: { schemaVersion: LAYOUT_SCHEMA_VERSION, cityId, cells } };
}
