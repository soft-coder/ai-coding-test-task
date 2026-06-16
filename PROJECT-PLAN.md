# Project plan

Companion to `CLAUDE.md`. This captures the planned sequence so any session can
pick up without the original chat. Order reflects dependencies.

## Phases (each phase = one issue → one branch → one PR)

1. **Scaffold & foundations**
   - `npx @angular/cli@19 new` with routing + chosen style format.
   - Project structure, base routing, lint config (`angular-eslint`).
   - Add `CLAUDE.md` and `docs/`.
   - Set up Playwright (e2e + visual regression), fixed viewport, gitignore for
     screenshot outputs, commit baseline scaffolding.

2. **Requirements & decomposition** *(planning, may not be a code PR)*
   - Draft `docs/requirements.md` from: task doc + Figma + OpenAPI JSON.
   - Review gaps with the reviewer (see open questions below).
   - Create GitHub issues + milestone + labels (`feature`, `infra`, `tests`).

3. **API layer**
   - Generate TypeScript interfaces/models from the OpenAPI JSON.
   - Typed API services; base URL/config; HTTP error handling.

4. **Auth / login**
   - Login page + reactive form + validation.
   - Functional auth guard + HTTP interceptor (token).
   - Token storage decision (see open questions).

5. **Table (read)**
   - CDK virtual scroll viewport wired to the API.
   - Loading / empty / error states.
   - Columns per the design.

6. **CRUD**
   - Create / edit (reactive forms, likely dialog) + delete (with confirmation).
   - Optimistic vs pessimistic update decision (see open questions).

7. **Polish**
   - Accessibility pass, responsive checks, final error/loading states.
   - Visual-regression baselines finalized; design-fidelity pass against Figma.

## Open questions to resolve with the reviewer

- Pagination model behind virtual scroll: full load vs paged (offset/cursor)?
- Token storage: in-memory vs localStorage vs cookie (security trade-offs); refresh?
- Form validation rules per field.
- CRUD update style: optimistic vs pessimistic.
- Table columns; do we need sorting / filtering?
- Delete confirmation UX.
- Responsive / mobile expectations; accessibility expectations.

## Environment note

Reality check on who runs things:
- **In Claude Code:** the assistant installs deps and runs lint/unit/e2e directly
  (with approval). Tightest loop.
- **In Chat tab:** the assistant cannot run the app (no network/browser in its
  sandbox); the human runs tests locally and shares results/screenshots.

Recommendation: build in Claude Code so the dev loop (incl. visual screenshots)
runs without a human in the execution path.
