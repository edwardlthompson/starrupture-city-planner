# Build Plan — StarRupture City Planner

<!-- remaining-tally -->
**Remaining:** AGENT 6 · LOCAL 6 · CLOUD 0 · AUTO 3 · HUMAN 6 · ADB 0 · **15 open**
<!-- /remaining-tally -->

Live board for this product repo. Finished work: [`COMPLETED_TASKS.md`](COMPLETED_TASKS.md).
Product brief (sacred): [`AGENT.md`](AGENT.md).

**Who:** `AGENT` code · `HUMAN` person · `ADB` device · `AUTO` CI/scripts
**Venue (AGENT only):** `[LOCAL]` This Computer · `[CLOUD]` Cursor Cloud — [`docs/adr/0008-agent-venue.md`](docs/adr/0008-agent-venue.md)
**State:** 🔲 open · ✅ done · ❌ blocked — reason

Format: `🔲 [AGENT][LOCAL] Short task — scope: path/prefix` (or `[CLOUD]`). Sequential `[AGENT]` first. Parallel scopes: [`docs/PARALLEL_AGENT_SCOPES.md`](docs/PARALLEL_AGENT_SCOPES.md). `/build` on This Computer picks LOCAL only; Cloud picks CLOUD only. HUMAN/ADB after automation → `HUMAN_BACKLOG.md`.

This file is the **child model**. After `init-project`, it becomes your `BUILD_PLAN.md`. On the bootstrap template, the live maintainer board is [`BUILD_PLAN.md`](BUILD_PLAN.md).

## Smoke gate (hard stop)

After every `[AGENT]` row: `python3 scripts/agent-run.py watch-agent-gates --once --autofix --scope auto`

After the **last** `[AGENT]`/`[AUTO]` row in a sprint is ✅, do **not** start the next sprint until this exits 0:

```bash
python3 scripts/agent-run.py smoke-sprint --require

```

That command re-smokes **every** ✅ row: no errors or crashes, plus startup time and load order. Details: [`docs/SPRINT_SMOKE.md`](docs/SPRINT_SMOKE.md). Fail → leave the last row open or ❌; fix; re-run. `/gates` wrap-up includes the same check.

---

## Product

Copy this shape when you add sprints: `### Sprint N — title`, then numbered rows. Keep it this short.

### Product (do not drift)

> Auto-managed from `AGENT.md` after init. Do not hand-edit inside markers. Read `AGENT.md` before any sprint row.

<!-- product-brief-sync:begin -->
> Read `AGENT.md` before any sprint row.

**One-liner:** Offline PWA that lets a StarRupture player plan a West-to-East city layout from a curated unlock checklist, with no internet connection.
**Do not drift:** starrupture, city planning, west-to-east, unlock checklist, offline pwa, localstorage, grid layout, pwa, web

**Rules:**
- LocalStorage-only persistence; no API, no backend, no telemetry.
- Keep FOSS (MIT); no paid SaaS, no analytics, no third-party runtime deps.
- Lighthouse performance / a11y / best-practices budgets stay ≥ 0.9 (see `docs/DESIGN_GUIDE.md` and `.lighthouserc.json`).
- Static data (unlock checklist) ≤ 300 lines per file; pure logic ≤ 150 lines per file (repo hard limits).
- i18n: strings in `src/locales/en.json` (default) and `src/locales/es.json`; never inline copy in components.
- Machine QA only — do not ask a human to review every frame/step of a layout.
- Do not overwrite the Sacred `branding/` vector assets (`branding/BRANDING.md`).

**First milestone:** Unlock-checklist data model + seeded localStorage persistence + a working grid view where the user can place/checklist-toggle buildings and save their plan — fully offline, Lighthouse ≥ 0.9 floors met.
<!-- product-brief-sync:end -->

### Sprint 0 — Sign-off

<!-- parallel_exception: CI sign-off is script-driven, not agent-scoped -->

1. 🔲 [AUTO] Sprint 0 sign-off on `main`: `validate-bootstrap --quick` · `feature-gate --stack <active>` · `check-github-ci --wait 300` (CI, Security Scan, CodeQL) · `check-license-compliance`

### Sprint 1 — Domain open items

<!-- parallel_exception: human source-of-truth + approval rows; AGENT work archived in COMPLETED_TASKS.md -->

1. 🔲 [HUMAN] Provide the canonical building list + unlock order, verbatim from the game (source of truth) — scope: examples/web/src/data/
2. 🔲 [HUMAN] Approve the domain model (ADR-0001) and Sprint 1

### Sprint 2 — Golden Path open items

<!-- parallel_exception: human verification + approval rows; AGENT work archived in COMPLETED_TASKS.md -->

1. 🔲 [HUMAN] Verify building names + unlock copy against the real game
2. 🔲 [HUMAN] Approve Sprint 2 after `smoke-sprint --require`

### Sprint 3 — Board playtest

<!-- parallel_exception: human playtest row; AGENT work archived in COMPLETED_TASKS.md -->

1. 🔲 [HUMAN] Playtest layout UX (snap feel, grid size, West→East orientation)

### Sprint 4 — Persistence & PWA (offline)

<!-- parallel_exception: service worker + PWA depend on the store; budget config spans the web root -->

1. 🔲 [AGENT][LOCAL] Save/Load to `localStorage` — versioned schema + migration (tests) — scope: examples/web/src/store/
2. 🔲 [AGENT][LOCAL] Offline service worker + `manifest.webmanifest` + install prompt — scope: examples/web/src/pwa/
3. 🔲 [AGENT][LOCAL] Lighthouse perf/a11y/best-practice budgets + SW cache budget gate — scope: examples/web/
4. 🔲 [HUMAN] Confirm install + offline behavior in a real browser

### Sprint 5 — Later scope (post-MVP)

<!-- parallel_exception: roadmap items; each ships as its own vertical slice later -->

Order: Theming (1) → Export/import (2) → Multi-city (3).

1. 🔲 [AGENT][LOCAL] Theming (light/dark, `prefers-color-scheme`) — scope: examples/web/src/
2. 🔲 [AGENT][LOCAL] Export/import layouts (JSON) — scope: examples/web/src/
3. 🔲 [AGENT][LOCAL] Multi-city layout support (separate boards) — scope: examples/web/src/

### Waiting on a person

> Retired: Android/ADB rows — web-only stack (`bootstrap.config.json` stacks: `["web"]`); no Android SDK/AVD needed.

### Open PRs (synced)

> Auto-managed on product repos too. Do not hand-edit rows inside the markers.

<!-- open-prs-sync:begin -->
- 🔲 [AUTO] Merge Dependabot [#3](https://github.com/edwardlthompson/starrupture-city-planner/pull/3) (Bump the android-dependencies group in /examples/android with 2 updates)
- 🔲 [AUTO] Merge Dependabot [#2](https://github.com/edwardlthompson/starrupture-city-planner/pull/2) (Bump the web-dependencies group in /examples/web with 5 updates)
<!-- open-prs-sync:end -->

### Template gaps (synced)

> Auto-managed Monday cron + `sync-template-gaps-build-plan`. Do not hand-edit inside markers. Plan-only — run `/upgrade` then name item numbers.

<!-- template-gaps-sync:begin -->
_No template gaps; .template-version matches upstream (or template maintainer N/A)._
<!-- template-gaps-sync:end -->

### UX & UI inventory

Complete list from construction gaps and `/ux-review`. Status is only planned / in_progress / done. `/build` does not execute these until `/ux-apply UX-NNN` (or a Sequential row). Follow [`docs/ux-ui-guidelines.md`](docs/ux-ui-guidelines.md) when shipping UI.

<!-- ux-inventory:begin -->
_No UX inventory items._
<!-- ux-inventory:end -->

### Local agent (This Computer)

Standing queue for This Computer. Rows: `🔲 [AGENT][LOCAL] … — scope: path`. `/build` claims these only. See [`docs/adr/0008-agent-venue.md`](docs/adr/0008-agent-venue.md).

<!-- local-agent-lane:begin -->
_No local agent items._
<!-- local-agent-lane:end -->

### Cloud agent (Cursor Cloud)

Standing queue for Cursor Cloud. Rows: `🔲 [AGENT][CLOUD] … — scope: path`. Cloud claims these only (`cursor/*`). Never edit Local lane or `[LOCAL]` rows.

<!-- cloud-agent-lane:begin -->
_No cloud agent items._
<!-- cloud-agent-lane:end -->

---

## Ongoing Maintenance

Not a checklist. GitHub Monday cron (`.github/workflows/weekly-health-check.yml`) already runs CI wait, security triage, parent template-gap BUILD_PLAN sync (this child board), radar, `update-deps` dry-run, Dependabot leftover list, open-PR BUILD_PLAN sync, and latest-release SBOM. Upgrade-sim stays on the template maintainer repo. `/ship` owns pre-release and the release tag.

If Monday cron is red: Cursor Automation `weekly-maintain`, then Grok Bot 4–5. Do not put those chores back on this board. [`docs/GROK_BOTS.md`](docs/GROK_BOTS.md) · [`docs/CURSOR_AUTOMATIONS.commercial.md`](docs/CURSOR_AUTOMATIONS.commercial.md)

---

## Archive

Older sprints: [`COMPLETED_TASKS.md`](COMPLETED_TASKS.md).
