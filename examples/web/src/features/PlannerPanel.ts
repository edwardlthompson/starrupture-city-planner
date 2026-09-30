import { t } from "../i18n";
import { createUnlockChecklist } from "./unlock/UnlockChecklist";
import { createBuildingLibrary } from "./library/BuildingLibrary";

const STORAGE_KEY = "planner.highestUnlockedOrder";

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

export type PlannerPanelProps = {
  onClose: () => void;
};

export function createPlannerPanel(props: PlannerPanelProps): HTMLElement {
  const { onClose } = props;
  let highestOrder = loadOrder();

  const panel = document.createElement("div");
  panel.className = "planner-panel";
  panel.setAttribute("data-testid", "planner-panel");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", t("planner.title"));

  // Header
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

  // Shared search field (filters both checklist and library)
  const searchWrap = document.createElement("div");
  searchWrap.className = "planner-search-wrap";
  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.className = "planner-search";
  searchInput.setAttribute("data-testid", "planner-search");
  searchInput.setAttribute("aria-label", t("planner.checklist.search"));
  searchInput.placeholder = t("planner.checklist.search");
  searchWrap.appendChild(searchInput);

  // Sections
  const body = document.createElement("div");
  body.className = "planner-body";

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

    const library = createBuildingLibrary({ highestUnlockedOrder: highestOrder });
    body.appendChild(library);
  }

  searchInput.addEventListener("input", () => {
    renderSections();
  });

  renderSections();
  panel.appendChild(searchWrap);
  panel.appendChild(body);

  return panel;
}