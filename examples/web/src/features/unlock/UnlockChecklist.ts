import { t } from "../../i18n";
import { STARRUPTURE_UNLOCK_CHECKLIST } from "../../data/unlockChecklist";
import { STARRUPTURE_BUILDINGS } from "../../data/buildings";
import { isUnlocked, unlockedCount } from "../../logic/unlockStatus";
import { tokensMatch } from "../../settings/search";

export type UnlockChecklistProps = {
  highestUnlockedOrder: number;
  query: string;
  onSetOrder: (order: number) => void;
};

export function createUnlockChecklist(props: UnlockChecklistProps): HTMLElement {
  const { highestUnlockedOrder, query, onSetOrder } = props;
  const total = STARRUPTURE_UNLOCK_CHECKLIST.length;
  const unlocked = unlockedCount(STARRUPTURE_UNLOCK_CHECKLIST, highestUnlockedOrder);

  const section = document.createElement("section");
  section.setAttribute("data-testid", "unlock-checklist");
  section.setAttribute("aria-label", t("planner.checklist.title"));

  // Header + count
  const header = document.createElement("div");
  header.className = "planner-section-header";
  const title = document.createElement("h3");
  title.textContent = t("planner.checklist.title");
  header.appendChild(title);

  const count = document.createElement("p");
  count.className = "planner-count";
  count.setAttribute("data-testid", "checklist-count");
  count.textContent = t("planner.checklist.count").replace("{unlocked}", String(unlocked)).replace("{total}", String(total));
  header.appendChild(count);
  section.appendChild(header);

  // List (filtered by the shared search box in the planner)
  const list = document.createElement("ol");
  list.className = "planner-checklist";
  list.setAttribute("data-testid", "checklist-list");

  const emptyMsg = document.createElement("p");
  emptyMsg.className = "planner-empty";
  emptyMsg.setAttribute("data-testid", "checklist-empty");
  emptyMsg.textContent = t("planner.checklist.empty");

  const entries = STARRUPTURE_UNLOCK_CHECKLIST.slice().sort((a, b) => a.order - b.order);

  let shown = 0;
  for (const entry of entries) {
    const building = STARRUPTURE_BUILDINGS.find((b) => b.id === entry.buildingId);
    if (!building) continue;
    if (!tokensMatch(query, building.name)) continue;
    shown++;
    const unlocked = isUnlocked(STARRUPTURE_UNLOCK_CHECKLIST, building.id, highestUnlockedOrder);

    const li = document.createElement("li");
    li.className = "planner-item" + (unlocked ? " planner-item--unlocked" : " planner-item--locked");
    li.setAttribute("data-building-id", building.id);
    li.setAttribute("data-order", String(entry.order));
    li.setAttribute("data-name", building.name.toLowerCase());
    li.setAttribute("role", "button");
    li.setAttribute("tabindex", "0");
    li.setAttribute("aria-label", `${building.name} — ${unlocked ? t("planner.checklist.unlocked") : t("planner.checklist.locked")}`);

    const badge = document.createElement("span");
    badge.className = "planner-badge";
    badge.textContent = unlocked ? t("planner.checklist.unlocked") : t("planner.checklist.locked");

    const name = document.createElement("span");
    name.className = "planner-item-name";
    name.textContent = building.name;

    li.appendChild(badge);
    li.appendChild(name);

    li.addEventListener("click", () => {
      // Set highest unlocked order to this building's order
      onSetOrder(entry.order);
    });
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSetOrder(entry.order);
      }
    });

    list.appendChild(li);
  }

  section.appendChild(list);
  section.appendChild(emptyMsg);
  emptyMsg.hidden = shown > 0;

  return section;
}