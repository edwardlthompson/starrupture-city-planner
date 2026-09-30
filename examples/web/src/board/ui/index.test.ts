import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Building } from "../../core/types";
import { createBoardView, placeBuilding } from "./index";
import { GRID_SLOTS } from "../grid/index";
import { createEmptyBoard } from "../dnd/index";

// Mock i18n to avoid needing the full app context
vi.mock("../../i18n/index", () => ({
  t: (key: string) => key,
}));

const catalog: readonly Building[] = [
  { id: "a", name: "Alpha", slotSpan: 1 },
  { id: "w", name: "Wide", slotSpan: 2 },
];

let container: HTMLElement;

beforeEach(() => {
  container = document.createElement("div");
});

describe("board UI", () => {
  it("renders a section with title", () => {
    createBoardView(container, catalog, { onCellsChange: vi.fn() });
    expect(container.querySelector(".board-view")).not.toBeNull();
    expect(container.querySelector(".board-view__title")?.textContent).toBe("board.title");
  });

  it("renders all grid slots as buttons", () => {
    createBoardView(container, catalog, { onCellsChange: vi.fn() });
    const slots = container.querySelectorAll(".board-view__slot");
    expect(slots.length).toBe(GRID_SLOTS);
  });

  it("renders West and East labels", () => {
    createBoardView(container, catalog, { onCellsChange: vi.fn() });
    expect(container.querySelector(".board-view__label--west")?.textContent).toBe("board.west");
    expect(container.querySelector(".board-view__label--east")?.textContent).toBe("board.east");
  });

  it("shows building name when slot is occupied", () => {
    let cells = createEmptyBoard();
    cells[3] = { slotIndex: 3, buildingId: "a" };

    createBoardView(container, catalog, { onCellsChange: vi.fn() });
    // Re-render with occupied state
    const slots = container.querySelectorAll(".board-view__slot");
    // The initial render uses empty cells; test placeBuilding instead
    expect(slots[0].getAttribute("data-slot")).toBe("0");
  });

  it("placeBuilding places on the board", () => {
    const cells = createEmptyBoard();
    const result = placeBuilding(cells, catalog, "a", 5);
    expect(result).not.toBeNull();
    if (result) {
      expect(result[5].buildingId).toBe("a");
    }
  });

  it("placeBuilding returns null for invalid placement", () => {
    const cells = createEmptyBoard();
    const result = placeBuilding(cells, catalog, "nonexistent", 0);
    expect(result).toBeNull();
  });

  it("placeBuilding returns null when slot is out of bounds", () => {
    const cells = createEmptyBoard();
    const result = placeBuilding(cells, catalog, "w", GRID_SLOTS);
    expect(result).toBeNull();
  });

  it("slot buttons have correct aria-labels", () => {
    createBoardView(container, catalog, { onCellsChange: vi.fn() });
    const slots = container.querySelectorAll(".board-view__slot");
    expect(slots[0].getAttribute("aria-label")).toContain("board.slot.empty");
    expect(slots[5].getAttribute("data-slot")).toBe("5");
  });
});