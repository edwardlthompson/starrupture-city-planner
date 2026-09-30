# AGENT.md — original product brief (Sacred)

Copied to `AGENT.md` and pasted with the original brief **before** `init-project`.
Read this before any `BUILD_PLAN.md` sprint row. Do not drift the product scope.

<!-- agent-brief:one-liner -->
Offline PWA that lets a StarRupture player plan a West-to-East city layout from a curated unlock checklist, with no internet connection.
<!-- /agent-brief:one-liner -->

<!-- agent-brief:keywords -->
StarRupture, city planning, West-to-East, unlock checklist, offline PWA, localStorage, grid layout, PWA, web
<!-- /agent-brief:keywords -->

## Original brief (verbatim)

> Platform / Tech stack: **web**.
> Purpose & goals: **Offline PWA to plan West-to-East StarRupture city layouts from an unlock checklist.**
> Distribution: Pure FOSS under MIT, distributed via GitHub Releases / GitHub Pages.

## Product definition (do not drift)

- **Domain:** StarRupture (game) city-layout planning, specifically **West-to-East** progression.
- **Core input:** an **unlock checklist** — the set of buildings/features the player can place, used to drive what appears on the board.
- **Core output:** a **planned city layout** the user can review, edit, and save before applying it in-game.
- **Hard constraints:**
  - **Offline-first** — must work with no network after first load.
  - **No cloud** — local-only persistence.
  - **PWA** — installable, service-worker cached, Lighthouse ≥ 0.9 floors.

## Rules

- LocalStorage-only persistence; no API, no backend, no telemetry.
- Keep FOSS (MIT); no paid SaaS, no analytics, no third-party runtime deps.
- Lighthouse performance / a11y / best-practices budgets stay ≥ 0.9 (see `docs/DESIGN_GUIDE.md` and `.lighthouserc.json`).
- Static data (unlock checklist) ≤ 300 lines per file; pure logic ≤ 150 lines per file (repo hard limits).
- i18n: strings in `src/locales/en.json` (default) and `src/locales/es.json`; never inline copy in components.
- Machine QA only — do not ask a human to review every frame/step of a layout.
- Do not overwrite the Sacred `branding/` vector assets (`branding/BRANDING.md`).

## Non-goals

- In-game integration / save-file export to the game client.
- Multiplayer / cloud sync / accounts.
- Multi-city / region planning beyond a single West-to-East board.
- Android / iOS native apps (web PWA only for now).

## Success metrics

- Offline install works and the app loads with zero network.
- A user can build, save, reload, and clear a full city layout in < 5 min on mobile.
- Lighthouse perf ≥ 0.9, a11y ≥ 0.95, best-practices ≥ 0.9 on the deployed site.
- All unit tests green; 100% of pure-logic modules covered; no regressions.

## First milestone

Unlock-checklist data model + seeded localStorage persistence + a working grid view where the user can place/checklist-toggle buildings and save their plan — fully offline, Lighthouse ≥ 0.9 floors met.
