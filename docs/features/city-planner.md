# Feature: City Planner

> Vertical slice shipped in Sprint 1 of `BUILD_PLAN.md`. Replaces the template
> Golden Path (`src/greet.ts` etc.) with the real product. See `AGENT.md` for the
> sacred brief and `docs/INITIALIZATION_PROMPT.md` for the original prompt.

## Acceptance criteria

- 🔲 User-visible behavior: on first launch, the app opens at the Westernmost city
  (city 1) unlocked, all others locked. Primary CTA is **Plan city** — opens the
  West→East layout editor for the current city.
- 🔲 Named primary CTA (one per view):
  - Home: **Plan city** (opens layout editor)
  - Layout editor: **Save layout** (persists and returns to Home)
  - Locked city screen: **View checklist** (shows unlock requirements)
- 🔲 Empty state: a city with no buildings placed shows "No buildings placed yet —
  tap a slot to place one." plus the **Plan city** CTA.
- 🔲 Error / loading:
  - Layout load failure (corrupt localStorage): show error panel with **Reset
    layout** and **Import backup** actions.
  - No permission-denied path (no camera, no geolocation).
- 🔲 Offline/error behavior: fully offline by default; export/import are
  user-initiated and work offline; SW precache guarantees first-load without
  network.
- 🔲 Accessibility:
  - Keyboard-only: tab order follows the West→East strip; arrow keys move the
    placement cursor; Enter places; Backspace clears.
  - Screen reader: each city slot is an `aria-pressed` toggle with a label
    including building name and slot index.
  - `prefers-reduced-motion` honored (no parallax, no auto-scroll).
- 🔲 i18n: all user-visible strings under `city.*` in `src/locales/en.json` and
  `src/locales/es.json`; no hardcoded copy in components.

## Smoke scenario

1. _Given_ the PWA is installed and offline (DevTools → Network → Offline)
2. _When_ the user opens the app, taps **Plan city** on city 1, places 3
   buildings on the West→East strip, and taps **Save layout**
3. _Then_ the layout persists (survives a hard refresh and a browser restart),
   city 1's checklist advances, and the next city becomes unlocked — with no
   console errors and no network requests.

## Container map

| Layer | Path |
|-------|------|
| Logic | `examples/web/src/city/` (state machine, unlock rules, layout model, persistence) |
| View | `examples/web/src/components/CityPlanner.ts` (layout editor, checklist, locked-city screen) |
| Tests | co-located unit tests (`examples/web/src/city/*.test.ts`) + e2e in `examples/web/e2e/` |
| Wiring | composition root ≤10 lines in `examples/web/src/main.ts` (replaces `greet.ts` import) |
| i18n | `examples/web/src/locales/en.json` + `es.json` (add `city.*` keys) |
| PWA | `examples/web/public/manifest.webmanifest` + SW precache (no change to budget) |
| Export | `examples/web/src/city/export.ts` (JSON in/out) |

## Tests

- Automated: yes — unit in `examples/web/src/city/*.test.ts`; e2e in
  `examples/web/e2e/city-planner.spec.ts`.
- Coverage: pure logic (state machine, unlock rules, layout model) at 100%
  statement + branch; one e2e smoke path per acceptance criterion above.

## Fallback validation

Required when Automated is **no**. Still name the smoke command when tests exist.

- Why tests are not feasible: N/A (automated tests exist)
- Command: `python3 scripts/agent-run.py feature-gate --stack web`

## Definition of Done

- All Acceptance criteria ✅ above.
- `npm test` in `examples/web/` green with the new suites.
- `npm run build` green; Lighthouse budgets (perf ≥ 0.9, a11y ≥ 0.95, BP ≥ 0.9)
  hold on the production build.
- `bash scripts/check-sw-cache-budget.sh` green.
- `bash scripts/check-design-cohesion.sh` green (Settings-only chrome unchanged).
- i18n parity: `python3 scripts/agent-run.py check-i18n-parity` green (en + es).
- Keyboard-only smoke passes (manual checklist, one session).
- No console errors in the smoke scenario above (offline).

## Notes

- Replaces the template's `src/greet.ts` Golden Path; `appBootstrap.ts` and
  `main.ts` stay as the composition roots (≤10 lines each).
- Reference exemplars: About screen (`examples/web/src/about/`), Settings
  (`examples/web/src/components/SettingsPanel.ts`), nav
  (`examples/web/src/nav/`).
- After each AGENT step: `bash scripts/watch-agent-gates.sh --once --autofix`.
- Export/import is the only network-capable surface; keep it user-initiated and
  FOSS (no third-party share SDK).
