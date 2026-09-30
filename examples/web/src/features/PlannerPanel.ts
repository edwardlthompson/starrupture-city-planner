import type { LayoutCell } from "../core/types";
import { t } from "../i18n";
import { createUnlockChecklist } from "./unlock/UnlockChecklist";
import { createBuildingLibrary } from "./library/BuildingLibrary";
import { createBoardView } from "../board/ui/index";
import { dropBuilding, createEmptyBoard } from "../board/dnd/index";
import { GRID_SLOTS } from "../board/grid/index";
import { STARRUPTURE_BUILDINGS } from "../data/buildings";

const STORAGE_KEY = "planner.highestUnlockedOrder";
const CELLS_KEY = "planner.layoutCells";

function loadOrder(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return 0;
    const n = parseInt(raw, 10);
    return Number.isInteger(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function saveOrder(order: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(order));
  } catch {
    // storage unavailable
  }
}

function loadCells(): LayoutCell[] {
  try {
    const raw = localStorage.getItem(CELLS_KEY);
    if (raw === null) return createEmptyBoard();
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as LayoutCell[];
    return createEmptyBoard();
  } catch {
    return createEmptyBoard();
  }
}

function saveCells(cells: LayoutCell[]): void {
  try {
    localStorage.setItem(CELLS_KEY, JSON.stringify(cells));
  } catch {
    // storage unavailable
  }
}

export type PlannerPanelProps = {
  onClose: () => void;
};

export function createPlannerPanel(props: PlannerPanelProps): HTMLElement {
  const { onClose } = props;
  let highestOrder = loadOrder();
  let cells = loadCells();

  const panel = document.createElement("div");
  panel.className = "planner-panel";
  panel.setAttribute("data-testid", "planner-panel");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", t("planner.title"));

  const header = document.createElement("div");
  header.className = "planner-header";
  const h2 = document.createElement("h2");
  h2.textContent = t("planner.title");
  header.appendChild(h2);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "planner-close";
  closeBtn.setAttribute("data-testid", "planner-close");
  closeBtn.setAttribute("aria-label", t("planner.close"));
  closeBtn.textContent = t("nav.back");
  closeBtn.addEventListener("click", onClose);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  const searchWrap = document.createElement("div");
  searchWrap.className = "planner-search-wrap";
  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.className = "planner-search";
  searchInput.setAttribute("data-testid", "planner-search");
  searchInput.setAttribute("aria-label", t("planner.checklist.search"));
  searchInput.placeholder = t("planner.checklist.search");
  searchWrap.appendChild(searchInput);

  const body = document.createElement("div");
  body.className = "planner-body";

  const boardHost = document.createElement("div");
  boardHost.className = "planner-board-host";
  const board = createBoardView(boardHost, STARRUPTURE_BUILDINGS, {
    onCellsChange: (next: LayoutCell[]) => {
      cells = next;
      saveCells(cells);
    },
  });

  function placeFromLibrary(buildingId: string): void {
    const building = STARRUPTURE_BUILDINGS.find((b) => b.id === buildingId);
    if (!building) return;
    for (let slot = 0; slot < GRID_SLOTS; slot++) {
      const result = dropBuilding(cells, building, slot);
      if (result.ok) {
        cells = result.value;
        saveCells(cells);
        board.render(cells);
        return;
      }
    }
    // No room: leave the board unchanged.
  }
  function renderSections(): void {
    body.innerHTML = "";
    const query = searchInput.value;
    const checklist = createUnlockChecklist({
      highestUnlockedOrder: highestOrder,
      query,
      onSetOrder: (order: number) => {
        highestOrder = order;
        saveOrder(order);
        renderSections();
      },
    });
    body.appendChild(checklist);

    const library = createBuildingLibrary({
      highestUnlockedOrder: highestOrder,
      onPlaceBuilding: placeFromLibrary,
    });
    body.appendChild(library);
  }

  searchInput.addEventListener("input", () => {
    renderSections();
  });
  renderSections();
  board.render(cells);
  panel.appendChild(searchWrap);
  panel.appendChild(body);
  panel.appendChild(boardHost);

  return panel;
}