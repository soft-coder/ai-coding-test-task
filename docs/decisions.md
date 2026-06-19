# Decisions (ADR-lite)

> Rationale behind the choices that shape the app. The terse one-line index lives
> in [CLAUDE.md](../CLAUDE.md) "Decisions log"; this file holds the *why*. New
> decisions are added here in the PR that introduces them.

## D1 — Listing/search/sort are client-side; the API contract is kept

**Context.** The brief asks for server-side paging (`pageNumber` from 0 until a
short page), `search`, and `sortDesc`. The live backend ignores all of them:
`GET /front/categories` always returns the full list (verified — no casing or
`skip`/`take` variant changes the result), and `CategoryListDto` has no `total` or
"has more" flag.

**Decision.** Keep the request contract (the generated client still sends
`search` / `sortDesc` / `pageNumber`) but implement search, sort, and the
virtual-scroll window **client-side** over the full list.

**Why.** It produces a working UX that matches the Figma (live search, sort toggle,
smooth scrolling) without pretending the backend does something it doesn't. Sending
the params keeps us faithful to the brief and future-proof if the backend later
honors them. CDK virtual scroll keeps rendering cheap even with the whole list in
memory.

**Trade-off.** Doesn't demonstrate true server-side infinite scroll. Acceptable:
the data volume is small and bounded, and the backend offers no paging to drive it.

## D2 — Table body on Angular CDK virtual scroll (not PrimeNG table virtual scroll)

**Context.** PrimeNG's table virtual scroll is oriented around a known
`totalRecords`. The list API returns neither a total nor paging metadata.

**Decision.** Render the table body inside `cdk-virtual-scroll-viewport`.

**Why.** CDK's append-driven virtualization fits an "all rows, render the visible
window" model cleanly and avoids fighting a total-aware grid. PrimeNG still provides
the surrounding controls (inputs, buttons, dialogs) and theme.

## D3 — JWT in localStorage with transparent refresh

**Decision.** Store `token` + `refreshToken` in `localStorage`; restore the session
on reload. An HTTP interceptor attaches the bearer token and, on `401`, calls
`refresh-token`, retries the request once, and logs out if refresh fails.

**Why.** Simplest approach that satisfies "survive reload" and "transparent refresh"
for a take-home. localStorage trades some XSS exposure for simplicity; documented
here as a conscious choice rather than an oversight.

## D4 — Add/Edit as routed dialogs at `/categories/:id`

**Decision.** The add/edit form is a PrimeNG dialog driven by the route
(`/categories/:id`, add at `/categories/new`), layered over the list.

**Why.** Matches the brief's URL scheme and the Figma overlay, makes the dialog
deep-linkable and back-button friendly, and keeps the list state underneath.

## D5 — API client generated from OpenAPI

**Decision.** Generate TS models/services from the `front` spec via
`openapitools/openapi-generator-cli` rather than hand-writing them. Base URL comes
from a gitignored env config (`.env.example` placeholder committed).

**Why.** The brief asks for it, types stay in sync with the backend, and it removes
a class of hand-transcription bugs. Thin Angular services wrap the generated client
where signal-friendly ergonomics help.

## D6 — UI on PrimeNG 19 + runtime theme preset

**Decision.** PrimeNG 19 for all controls/dialogs; theme via a runtime preset
(`src/app/core/theme/app-preset.ts`) anchored to the Figma palette (primary
`#005baa`, danger `#a9120a`, Roboto). Light mode only.

**Why.** The Figma controls map almost 1:1 onto PrimeNG, so fidelity is cheap and
the design stays consistent.

## D7 — Two-layer visual testing

**Decision.** (1) Automated Playwright screenshot-diff gate with committed
baselines; (2) qualitative Figma fidelity pass (human/assistant judgment, not an
automated gate). Fixed 1920×1080 viewport matches the Figma frame.

**Why.** Render-vs-render diffs are a reliable regression gate; Figma-export vs
browser-render diffs are too noisy to gate on, so fidelity stays a judgment call.

## D8 — Secrets and links stay out of the public repo

**Decision.** Backend host, spec URL, the Figma link, and test credentials are
never committed; they live in local config (`.env`) and a gitignored `_design/`
folder for reference screenshots and the fetched spec.

**Why.** The repo is a public pet project; keeping it free of environment-specific
URLs and credentials is both safer and cleaner.
