# CLAUDE.md — Project context & working agreement

> This file is the durable source of truth for how we work on this project.
> Claude Code reads it at the start of every session. Keep it short and high-signal.
> If a decision changes, update this file in the same PR.

## Project overview

Angular take-home assignment. Small app, but the real deliverable is a clean,
reviewable **workflow demonstrated through git history** (issues → branches →
PRs → review → merge), not just the running app.

App scope:
- Login page (auth against the backend API).
- Data table with **virtual scroll**.
- Full **CRUD** on the table data (create / edit / delete).
- Wired to a backend API described by an OpenAPI/Swagger JSON.

## Stack

- **Angular 19** (chosen for reliability; do not bump major without discussion).
- Angular CLI 19. Scaffold via `npx @angular/cli@19 new` so the global CLI is untouched.
- Modern Angular only: **standalone** components, **signals**
  (`signal`/`computed`/`effect`, `input()`/`output()`/`model()`),
  **new control flow** (`@if`/`@for`/`@switch`/`@defer`), `inject()`,
  **functional** guards & interceptors.
- **UI: PrimeNG 19** (`primeng` + `@primeng/themes` + `primeicons`). The Figma
  design maps directly onto PrimeNG controls (inputtext, button, dialog). Theme
  via a runtime preset (`src/app/core/theme/app-preset.ts`) anchored to the Figma
  palette (primary `#005baa`, danger `#a9120a`, font Roboto).
- Virtual scroll: **Angular CDK** (`cdk-virtual-scroll-viewport`) for the table
  body — the list API returns no total count, so CDK's append-driven
  virtualization fits infinite scroll better than a total-aware grid.
- API client generated from the backend `front` OpenAPI via
  `openapitools/openapi-generator-cli`. The API base URL is read from a gitignored
  environment config (not committed — a `.env.example` placeholder ships instead).
- RxJS where it fits (HTTP, streams); prefer signals for component state.

## Commands

> Finalize these right after scaffold and keep them accurate — Claude Code relies on them.

- Install: `npm ci` / `npm install` (the assistant runs these directly).
- Dev server: `npm start` (`ng serve`)
- Unit tests: `npm test`
- Lint: `npm run lint`
- E2E + visual: `npm run e2e` (Playwright)
- Update visual baselines (deliberate UI change only): `npm run e2e -- --update-snapshots`

## Workflow (git flow)

- Branch off `develop`. Feature branches: `feature/<issue-number>-<slug>`.
- **One issue → one branch → one PR.** Keep PRs small and reviewable.
- PR targets `develop`. Human reviewer approves; then merge (squash).
- Reviewer leaves feedback as a **GitHub Review** (summary + inline comments on
  "Files changed"), not as standalone conversation comments — those are what the
  tooling reads reliably.
- Before opening a PR: run lint + unit + e2e and make them green.

## Testing strategy — two layers

1. **Visual regression (automated gate):** Playwright screenshot diff,
   render-vs-render, with a tolerance (`maxDiffPixelRatio`/`threshold`).
   Baselines are **committed** to the repo; they are the source of truth.
2. **Design fidelity (qualitative):** compare implementation against the Figma
   design. This is a human/assistant judgment pass, **not** an automated gate
   (Figma export vs browser render are different renderers → pixel diff is noisy).
   Fixed viewport in Playwright config to match the Figma frame.

Screenshot hygiene:
- Commit: visual-regression **baselines** only.
- Gitignore: `test-results/`, `*-actual.png`, `*-diff.png` (regenerated each run).

## Conventions

- Comments explain **why, not what**. No comments that restate the code.
- TSDoc on the public surface (services, public methods, non-obvious types).
- Clear names and small files over heavy commenting.
- Keep this file + `docs/` current — the repo is the durable context, not the chat.

## Open inputs — resolved

- [x] Task: **Справочник категорий** (categories reference) → `docs/requirements.md`.
- [x] Backend API: the `front` OpenAPI spec → TS client via `openapi-generator-cli`.
      The API host, spec URL, and test credentials are kept out of the repo
      (provided locally — this is a public pet project).
- [x] Figma design → connected via Figma MCP locally for fidelity checks. The
      design link is **not** committed (private file).

## Decisions log

- Angular 19 + CLI 19 (reliability sweet spot).
- git flow, PR-driven, decomposed into GitHub issues.
- No GitHub Actions / CI (setup cost not worth it for this take-home) — tests run
  locally. In Claude Code, the assistant runs them directly with user approval.
- Two-layer visual testing (regression gate + qualitative fidelity).
- Repo-as-source-of-truth to survive lack of cross-session chat memory.
- UI library: **PrimeNG 19** (design is PrimeNG-native); theme via runtime preset.
- Table body on **Angular CDK** virtual scroll (API has no total count).
- Listing/search/sort **client-side** — backend ignores `pageNumber`/`search`/`sortDesc`
  and returns the full list; client still sends the params but filters/sorts/windows
  locally. See `docs/decisions.md` (D1).
- JWT (`token` + `refreshToken`) in **localStorage**; transparent refresh on 401.
- Add/edit as **routed dialogs** at `/categories/:id`.
- API client **generated** from OpenAPI (`openapi-generator-cli`), not hand-written.
- Public pet project → backend host/spec URLs, Figma link, and test credentials
  stay out of git (local env config only).
