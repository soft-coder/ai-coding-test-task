# Categories reference

Angular 19 take-home: a categories reference (login → virtual-scroll table → full
CRUD) wired to the `front` backend API. The real deliverable is a clean,
reviewable workflow demonstrated through git history (issues → branches → PRs →
review → merge), not just the running app.

## Docs

- [docs/requirements.md](docs/requirements.md) — screens, API contract, behaviors.
- [docs/decisions.md](docs/decisions.md) — why the key choices were made (ADR-lite).
- [CLAUDE.md](CLAUDE.md) — working agreement and decisions log.

## Stack

Angular 19 (standalone, signals, new control flow, functional guards/interceptors),
PrimeNG 19 + runtime theme preset, Angular CDK virtual scroll, RxJS for HTTP.
API client generated from the `front` OpenAPI spec. Playwright for e2e + visual
regression.

## Getting started

```bash
npm install                 # install dependencies
npx playwright install chromium   # one-time, for e2e
npm start                   # dev server at http://localhost:4200
```

The API base URL and credentials are not committed. Copy `.env.example` to `.env`
and fill in the local values (added with the API layer).

> **CORS during local dev:** the public `front` backend doesn't send
> `Access-Control-Allow-Origin` for `localhost`, so live API calls from
> `npm start` are blocked by the browser. Use a CORS-bypass extension while
> developing (e.g. [CORS Everywhere](https://addons.mozilla.org/firefox/addon/cors-everywhere/)
> for Firefox, or an equivalent for Chrome) and enable it for the app tab. This
> only affects calls to the real API — the Playwright e2e suite mocks the backend,
> so it needs no such workaround.

## Commands

| Command | What it does |
|---|---|
| `npm start` | Dev server (`ng serve`) |
| `npm run build` | Production build to `dist/` |
| `npm test` | Unit tests (Karma/Jasmine) |
| `npm run lint` | ESLint (`angular-eslint` + `typescript-eslint`) |
| `npm run e2e` | Playwright e2e + visual regression |
| `npm run e2e -- --update-snapshots` | Refresh visual baselines (deliberate UI changes only) |

## Testing

Two layers: an automated Playwright **visual-regression** gate (committed baselines
at a fixed 1920×1080 viewport) and a qualitative **design-fidelity** pass against
the Figma frames. See [docs/requirements.md](docs/requirements.md#testing).

## Workflow

Branch off `develop` as `feature/<issue>-<slug>`; one issue → one branch → one PR
into `develop`; squash-merge after review. Lint + unit + e2e green before opening a PR.
