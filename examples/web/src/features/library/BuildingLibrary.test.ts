import { describe, expect, it } from "vitest";
import { createBuildingLibrary } from "./BuildingLibrary";
import { STARRUPTURE_BUILDINGS } from "../../data/buildings";

describe("BuildingLibrary", () => {
  it("renders all buildings in the grid", () => {
    const el = createBuildingLibrary({ highestUnlockedOrder: 0 });
    const grid = el.querySelector("[data-testid='library-grid']")!;
    const cards = Array.from(grid.children);
    expect(cards.length).toBe(STARRUPTURE_BUILDINGS.length);
  });

  it("shows correct unlock state per card", () => {
    const el = createBuildingLibrary({ highestUnlockedOrder: 2 });
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-testid='library-grid'] > div"));
    expect(cards[0].dataset.unlocked).toBe("true");
    expect(cards[1].dataset.unlocked).toBe("true");
    expect(cards[2].dataset.unlocked).toBe("false");
  });

  it("shows slot span text", () => {
    const el = createBuildingLibrary({ highestUnlockedOrder: 0 });
    const first = el.querySelector("[data-building-id='foundation']") as HTMLElement;
    expect(first.textContent).toContain("1");
    const fabricator = el.querySelector("[data-building-id='fabricator']") as HTMLElement;
    expect(fabricator.textContent).toContain("2");
  });

  it("filters to unlocked only", () => {
    const el = createBuildingLibrary({ highestUnlockedOrder: 2 });
    const unlockedBtn = el.querySelector("[data-filter='unlocked']") as HTMLButtonElement;
    unlockedBtn.click();
    const visible = Array.from(
      el.querySelectorAll<HTMLElement>("[data-testid='library-grid'] > div"),
    ).filter((c) => !c.hidden);
    expect(visible.length).toBe(2);
    expect(visible.every((c) => c.dataset.unlocked === "true")).toBe(true);
  });

  it("filters to locked only", () => {
    const el = createBuildingLibrary({ highestUnlockedOrder: 2 });
    const lockedBtn = el.querySelector("[data-filter='locked']") as HTMLButtonElement;
    lockedBtn.click();
    const visible = Array.from(
      el.querySelectorAll<HTMLElement>("[data-testid='library-grid'] > div"),
    ).filter((c) => !c.hidden);
    expect(visible.length).toBe(STARRUPTURE_BUILDINGS.length - 2);
    expect(visible.every((c) => c.dataset.unlocked === "false")).toBe(true);
  });

  it("shows empty message when filter has no matches", () => {
    const el = createBuildingLibrary({ highestUnlockedOrder: 0 });
    const unlockedBtn = el.querySelector("[data-filter='unlocked']") as HTMLButtonElement;
    unlockedBtn.click();
    const empty = el.querySelector("[data-testid='library-empty']") as HTMLElement;
    expect(empty.hidden).toBe(false);
  });

  it("filter buttons have proper ARIA roles", () => {
    const el = createBuildingLibrary({ highestUnlockedOrder: 0 });
    const btns = el.querySelectorAll("[data-filter]");
    expect(btns.length).toBe(3);
    btns.forEach((btn) => {
      expect(btn.getAttribute("role")).toBe("tab");
      expect(["true", "false"]).toContain(btn.getAttribute("aria-selected"));
    });
    expect(el.querySelector("[data-filter='all']")!.getAttribute("aria-selected")).toBe("true");
  });

  it("grid has proper list semantics", () => {
    const el = createBuildingLibrary({ highestUnlockedOrder: 0 });
    const grid = el.querySelector("[data-testid='library-grid']")!;
    expect(grid.getAttribute("role")).toBe("list");
    const card = grid.firstElementChild as HTMLElement;
    expect(card.getAttribute("role")).toBe("listitem");
    expect(card.getAttribute("aria-label")).toContain("Foundation");
  });
});