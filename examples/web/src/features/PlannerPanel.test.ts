import { describe, expect, it, vi, beforeEach } from "vitest";
import { createPlannerPanel } from "./PlannerPanel";

beforeEach(() => {
  localStorage.clear();
});

describe("PlannerPanel", () => {
  it("renders the panel with dialog role", () => {
    const el = createPlannerPanel({ onClose: vi.fn() });
    expect(el.getAttribute("role")).toBe("dialog");
    expect(el.getAttribute("data-testid")).toBe("planner-panel");
  });

  it("has a close button that calls onClose", () => {
    const onClose = vi.fn();
    const el = createPlannerPanel({ onClose });
    const btn = el.querySelector("[data-testid='planner-close']") as HTMLButtonElement;
    expect(btn).not.toBeNull();
    btn.click();
    expect(onClose).toHaveBeenCalled();
  });

  it("contains both checklist and library sections", () => {
    const el = createPlannerPanel({ onClose: vi.fn() });
    expect(el.querySelector("[data-testid='unlock-checklist']")).not.toBeNull();
    expect(el.querySelector("[data-testid='building-library']")).not.toBeNull();
  });

  it("persists unlock order to localStorage", () => {
    const el = createPlannerPanel({ onClose: vi.fn() });
    // Click on order 4
    const item = el.querySelector("[data-order='4']") as HTMLElement;
    item.click();
    expect(localStorage.getItem("planner.highestUnlockedOrder")).toBe("4");
  });

  it("re-renders after setting order", () => {
    const el = createPlannerPanel({ onClose: vi.fn() });
    // Set order to 3
    const item = el.querySelector("[data-order='3']") as HTMLElement;
    item.click();
    // After re-render, item at order 3 should be unlocked
    const reRendered = el.querySelector("[data-testid='unlock-checklist']")!;
    const items = Array.from(reRendered.querySelectorAll("li"));
    expect(items[0].className).toContain("unlocked");
    expect(items[2].className).toContain("unlocked");
    expect(items[3].className).toContain("locked");
  });

  it("loads persisted order on creation", () => {
    localStorage.setItem("planner.highestUnlockedOrder", "5");
    const el = createPlannerPanel({ onClose: vi.fn() });
    const checklist = el.querySelector("[data-testid='unlock-checklist']")!;
    const items = Array.from(checklist.querySelectorAll("li"));
    expect(items[0].className).toContain("unlocked");
    expect(items[4].className).toContain("unlocked");
    expect(items[5].className).toContain("locked");
  });

  it("panel has proper ARIA label", () => {
    const el = createPlannerPanel({ onClose: vi.fn() });
    expect(el.getAttribute("aria-label")).toBeTruthy();
    expect(el.querySelector("h2")!.textContent).toBeTruthy();
  });
});