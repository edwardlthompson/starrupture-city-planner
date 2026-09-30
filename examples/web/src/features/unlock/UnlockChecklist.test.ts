import { describe, expect, it, vi } from "vitest";
import { createUnlockChecklist } from "./UnlockChecklist";
import { STARRUPTURE_UNLOCK_CHECKLIST } from "../../data/unlockChecklist";
import { STARRUPTURE_BUILDINGS } from "../../data/buildings";

function setup(highest = 3, query = "") {
  const onSetOrder = vi.fn();
  const el = createUnlockChecklist({ highestUnlockedOrder: highest, query, onSetOrder });
  return { el, onSetOrder };
}

describe("UnlockChecklist", () => {
  it("renders all buildings in order", () => {
    const { el } = setup();
    const list = el.querySelector("[data-testid='checklist-list']")!;
    const items = Array.from(list.children) as HTMLElement[];
    expect(items.length).toBe(STARRUPTURE_UNLOCK_CHECKLIST.length);
    // First item should be order 1
    expect(items[0].dataset.order).toBe("1");
    expect(items[1].dataset.order).toBe("2");
  });

  it("marks unlocked and locked items correctly", () => {
    const { el } = setup(3); // first 3 unlocked
    const items = Array.from(
      el.querySelectorAll<HTMLElement>("[data-testid='checklist-list'] > li"),
    );
    expect(items[0].className).toContain("unlocked");
    expect(items[1].className).toContain("unlocked");
    expect(items[2].className).toContain("unlocked");
    expect(items[3].className).toContain("locked");
  });

  it("shows correct count text", () => {
    const { el } = setup(3);
    const count = el.querySelector("[data-testid='checklist-count']") as HTMLElement;
    expect(count.textContent).toContain("3");
    expect(count.textContent).toContain(String(STARRUPTURE_UNLOCK_CHECKLIST.length));
  });

  it("calls onSetOrder when an item is clicked", () => {
    const { el, onSetOrder } = setup(0);
    const item = el.querySelector("[data-order='5']") as HTMLElement;
    item.click();
    expect(onSetOrder).toHaveBeenCalledWith(5);
  });

  it("filters items by the query prop", () => {
    const { el } = setup(0, "power");
    const visible = Array.from(
      el.querySelectorAll<HTMLElement>("[data-testid='checklist-list'] > li"),
    ).filter((li) => !li.hidden);
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.every((li) => (li.dataset.name ?? "").includes("power"))).toBe(true);
  });

  it("shows empty message when the query has no matches", () => {
    const { el } = setup(0, "zzzzz");
    const empty = el.querySelector("[data-testid='checklist-empty']") as HTMLElement;
    expect(empty.hidden).toBe(false);
  });

  it("items have proper ARIA roles and labels", () => {
    const { el } = setup(2);
    const item = el.querySelector("[data-order='1']") as HTMLElement;
    const firstEntry = STARRUPTURE_UNLOCK_CHECKLIST.find((e) => e.order === 1)!;
    const firstName =
      STARRUPTURE_BUILDINGS.find((b) => b.id === firstEntry.buildingId)?.name ?? "";
    expect(item.getAttribute("role")).toBe("button");
    expect(item.getAttribute("tabindex")).toBe("0");
    expect(item.getAttribute("aria-label")).toContain(firstName);
    expect(item.getAttribute("aria-label")).toContain("Unlocked");
  });

  it("keyboard activation works", () => {
    const { el, onSetOrder } = setup(0);
    const item = el.querySelector("[data-order='2']") as HTMLElement;
    item.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(onSetOrder).toHaveBeenCalledWith(2);
  });
});