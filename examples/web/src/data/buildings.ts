import type { Building } from "../core/types";

/**
 * StarRupture building catalog.
 *
 * PROVISIONAL DRAFT — this structure and validation are the Sprint 1 deliverable;
 * the entries below are placeholders pending the canonical building list and
 * unlock order (BUILD_PLAN.md Sprint 1 row 4). Swap in the real names/ids
 * verbatim; the types and pure logic are not expected to change.
 *
 * Every entry satisfies `validateBuilding` (enforced by `buildings.test.ts`).
 */
export const STARRUPTURE_BUILDINGS: readonly Building[] = [
  { id: "foundation", name: "Foundation", slotSpan: 1 },
  { id: "power-cell", name: "Power Cell", slotSpan: 1 },
  { id: "water-reclaimer", name: "Water Reclaimer", slotSpan: 1 },
  { id: "fabricator", name: "Fabricator", slotSpan: 2 },
  { id: "greenhouse", name: "Greenhouse", slotSpan: 1 },
  { id: "defense-turret", name: "Defense Turret", slotSpan: 1 },
  { id: "comms-array", name: "Comms Array", slotSpan: 1 },
  { id: "foundry", name: "Foundry", slotSpan: 2 },
  { id: "reactor", name: "Reactor", slotSpan: 2 },
  { id: "beacon", name: "Beacon", slotSpan: 1 },
  { id: "vault", name: "Vault", slotSpan: 1 },
  { id: "airdock", name: "Airdock", slotSpan: 1 },
];

/** Look up a building by id; undefined when absent. */
export function buildingById(catalog: readonly Building[], id: string): Building | undefined {
  return catalog.find((building) => building.id === id);
}
