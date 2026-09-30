import { t } from "../../i18n";
import { STARRUPTURE_BUILDINGS } from "../../data/buildings";
import { isUnlocked } from "../../logic/unlockStatus";
import { STARRUPTURE_UNLOCK_CHECKLIST } from "../../data/unlockChecklist";

export type LibraryFilter = "all" | "unlocked" | "locked";

export type BuildingLibraryProps = {
  highestUnlockedOrder: number;
};

export function createBuildingLibrary(props: BuildingLibraryProps): HTMLElement {
  const { highestUnlockedOrder } = props;

  const section = document.createElement("section");
  section.setAttribute("data-testid", "building-library");
  section.setAttribute("aria-label", t("planner.library.title"));

  // Header
  const header = document.createElement("div");
  header.className = "planner-section-header";
  const title = document.createElement("h3");
  title.textContent = t("planner.library.title");
  header.appendChild(title);
  section.appendChild(header);

  // Filter buttons
  const filterBar = document.createElement("div");
  filterBar.className = "planner-filter-bar";
  filterBar.setAttribute("role", "tablist");
  filterBar.setAttribute("aria-label", t("planner.library.title"));

  const filters: LibraryFilter[] = ["all", "unlocked", "locked"];
  const filterButtons = new Map<LibraryFilter, HTMLButtonElement>();

  for (const filter of filters) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "planner-filter-btn";
    btn.setAttribute("data-filter", filter);
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", filter === "all" ? "true" : "false");
    btn.textContent = t(`planner.library.filter.${filter}`);
    filterBar.appendChild(btn);
    filterButtons.set(filter, btn);
  }
  section.appendChild(filterBar);

  // Grid
  const grid = document.createElement("div");
  grid.className = "planner-grid";
  grid.setAttribute("data-testid", "library-grid");
  grid.setAttribute("role", "list");

  for (const building of STARRUPTURE_BUILDINGS) {
    const unlocked = isUnlocked(STARRUPTURE_UNLOCK_CHECKLIST, building.id, highestUnlockedOrder);
    const card = document.createElement("div");
    card.className = "planner-card" + (unlocked ? " planner-card--unlocked" : " planner-card--locked");
    card.setAttribute("data-building-id", building.id);
    card.setAttribute("data-unlocked", String(unlocked));
    card.setAttribute("role", "listitem");
    card.setAttribute("aria-label", `${building.name}, ${t("planner.library.slot_span").replace("{span}", String(building.slotSpan))}, ${unlocked ? t("planner.checklist.unlocked") : t("planner.checklist.locked")}`);

    const name = document.createElement("h4");
    name.textContent = building.name;
    card.appendChild(name);

    const span = document.createElement("p");
    span.className = "planner-card-span";
    span.textContent = t("planner.library.slot_span").replace("{span}", String(building.slotSpan));
    card.appendChild(span);

    const badge = document.createElement("span");
    badge.className = "planner-badge";
    badge.textContent = unlocked ? t("planner.checklist.unlocked") : t("planner.checklist.locked");
    card.appendChild(badge);

    grid.appendChild(card);
  }

  section.appendChild(grid);

  // Empty state
  const emptyMsg = document.createElement("p");
  emptyMsg.className = "planner-empty";
  emptyMsg.setAttribute("data-testid", "library-empty");
  emptyMsg.textContent = t("planner.library.empty");
  emptyMsg.hidden = true;
  section.appendChild(emptyMsg);

  // Filter logic
  function applyFilter(filter: LibraryFilter): void {
    for (const [key, btn] of filterButtons) {
      btn.setAttribute("aria-selected", key === filter ? "true" : "false");
    }
    const cards = Array.from(grid.children) as HTMLElement[];
    let shown = 0;
    for (const card of cards) {
      const unlocked = card.dataset.unlocked === "true";
      let visible = true;
      if (filter === "unlocked") visible = unlocked;
      else if (filter === "locked") visible = !unlocked;
      card.hidden = !visible;
      if (visible) shown++;
    }
    emptyMsg.hidden = shown > 0;
  }

  for (const [filter, btn] of filterButtons) {
    btn.addEventListener("click", () => applyFilter(filter));
  }

  return section;
}