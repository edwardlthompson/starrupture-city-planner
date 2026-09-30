/**
 * Board view component: renders the West→East layout strip.
 * Supports building placement via click-to-place (accessible) and
 * visual slot highlighting.
 */
import type { Building, LayoutCell } from "../../core/types";
import { t } from "../../i18n/index";
import { GRID_SLOTS } from "../grid/index";
import { dropBuilding, removeAt, createEmptyBoard, findBuildingStart } from "../dnd/index";

export type BoardCallbacks = {
  onCellsChange: (cells: LayoutCell[]) => void;
};

/**
 * Creates the board view inside `container`.
 * - Renders a horizontal strip of `GRID_SLOTS` cells.
 * - Each cell is a `<button>` for accessibility (tap to select/remove).
 * - Buildings render their name; empty cells show "·".
 * - `aria-label` describes state for screen readers.
 *
 * Returns a `render` function to re-render when `cells` changes,
 * and a `setCells` to imperatively update.
 */
export function createBoardView(
  container: HTMLElement,
  catalog: readonly Building[],
  callbacks: BoardCallbacks,
): { render: (cells: LayoutCell[]) => void; setCells: (cells: LayoutCell[]) => void } {
  let currentCells: LayoutCell[] = createEmptyBoard();

  const buildingMap = new Map(catalog.map((b) => [b.id, b]));

  function render(cells: LayoutCell[]): void {
    currentCells = cells;
    container.innerHTML = "";

    const section = document.createElement("section");
    section.className = "board-view";
    section.setAttribute("aria-label", t("board.title"));

    const heading = document.createElement("h3");
    heading.className = "board-view__title";
    heading.textContent = t("board.title");
    section.appendChild(heading);

    const hint = document.createElement("p");
    hint.className = "board-view__hint";
    hint.textContent = t("board.hint");
    section.appendChild(hint);

    // West / East labels
    const labels = document.createElement("div");
    labels.className = "board-view__labels";
    labels.innerHTML = `<span class="board-view__label board-view__label--west">${t("board.west")}</span><span class="board-view__label board-view__label--east">${t("board.east")}</span>`;
    section.appendChild(labels);

    // Strip
    const strip = document.createElement("div");
    strip.className = "board-view__strip";
    strip.setAttribute("role", "list");
    strip.setAttribute("aria-label", t("board.strip.aria"));

    for (let i = 0; i < GRID_SLOTS; i++) {
      const cell = cells.find((c) => c.slotIndex === i);
      const buildingId = cell?.buildingId ?? null;
      const building = buildingId ? buildingMap.get(buildingId) : undefined;

      const slotEl = document.createElement("button");
      slotEl.type = "button";
      slotEl.className = "board-view__slot" + (buildingId ? " board-view__slot--occupied" : "");
      slotEl.setAttribute("role", "listitem");
      slotEl.setAttribute("data-slot", String(i));

      if (building) {
        slotEl.textContent = building.name;
        slotEl.setAttribute("aria-label", `${t("board.slot.occupied")}: ${building.name} (${t("board.slot_index")} ${i})`);
        slotEl.title = building.name;
      } else {
        slotEl.textContent = "·";
        slotEl.setAttribute("aria-label", `${t("board.slot.empty")} ${i}`);
      }

      // Click to remove if occupied
      if (buildingId && building) {
        slotEl.addEventListener("click", () => {
          const start = findBuildingStart(currentCells, buildingId);
          if (start === -1) return;
          const result = removeAt(currentCells, start, building.slotSpan);
          if (result.ok) callbacks.onCellsChange(result.value);
        });
      }

      strip.appendChild(slotEl);
    }

    section.appendChild(strip);
    container.appendChild(section);
  }

  function setCells(cells: LayoutCell[]): void {
    render(cells);
  }

  // Initial render
  render(currentCells);

  return { render, setCells };
}

/**
 * Helper: places a building from the catalog onto the board at a given slot.
 * Returns the new cells or null if placement failed.
 */
export function placeBuilding(
  cells: LayoutCell[],
  catalog: readonly Building[],
  buildingId: string,
  slot: number,
): LayoutCell[] | null {
  const building = catalog.find((b) => b.id === buildingId);
  if (!building) return null;
  const result = dropBuilding(cells, building, slot);
  return result.ok ? result.value : null;
}