# Requirements — Categories reference (Справочник категорий)

> Self-contained spec derived from the task brief, the live `front` OpenAPI spec,
> and the Figma design. The repo is the source of truth; nothing here depends on
> chat history. Backend host, spec URL, the Figma link, and test credentials are
> kept out of git (public pet project) — they live in local config only.

## Goal

A categories reference with list (virtual scroll), create, edit, and delete,
behind JWT auth. The primary deliverable is a clean, reviewable git workflow.

## Screens

### Login — 3 states (Figma: `Авторизация`, `… / Не заполнено`, `… / Ошибка входа`)

- Centered card titled **Logon to Zidium**, fields **Login** + **Password**,
  primary **Logon** button.
- **Validation state:** empty field → red border + `Field is required` under it.
- **Server-error state:** backend error rendered under the form (e.g. `User is blocked`).
- On success → store tokens + user, navigate to `/categories`.

### Categories list (Figma: `Справочник`)

- App shell: left icon rail (~78px) — collapse arrow (top); tree, gear (active),
  profile, logout (bottom).
- Header **Categories** (left) + **+ Add** (top-right). Full-width **Search** below.
- Table columns **Id** + **Name** (task-specific — see [Design vs data](#design-vs-data)).
  Per-row **delete** (trash) icon. Row click → `/categories/:id`.
- Virtual scroll body (Angular CDK). Search filters; clicking the **Name** header
  toggles sort direction (`sortDesc`, initial `false`).
- Permission gating: `canAdd=false` hides **+ Add**; per row `canEdit=false` /
  `canDelete=false` hide the edit affordance / delete icon.
- Loading / empty / error states.

### Add / Edit (routed dialog at `/categories/:id`; add at `/categories/new`)

- Figma `Справочник / Добавление` (title **Add**) and `… / Редактирование` (title **Edit**).
- Field per the brief for **this** reference: **Name** (input). `Close` (secondary)
  + `Save` (primary). (The Id is omitted from the dialog — it's not user-editable and
  already visible in the list; keeping the dialog to the single editable field.)
- `canEdit=false` → fields read-only, **Save** hidden.
- **Name** is required and async-validated server-side (see name-exists below).

### Delete (Figma: `Справочник / Удаление`)

- Confirmation dialog: title **Confirmation**, body `Sure to delete this element?`,
  `Close` (secondary) + `Delete` (red/danger). Confirm → delete → refresh list.

## API contract (`front` OpenAPI 3.0.1 — "Zidium Front")

All category endpoints require `Authorization: Bearer <token>` (`jwtAuth`).

### Auth

| Method & path | Request | Response |
|---|---|---|
| `POST /front/logon` | `LogonRequestDto { login, password }` | `LogonResponseDto { token, refreshToken, user }` |
| `POST /front/logon/refresh-token` | `RefreshTokenRequestDto { refreshToken }` | `TokensResponseDto { token, refreshToken }` |
| `GET /front/logon/current-user` | — | `CurrentUserDto { displayName, timezoneOffset, permissions }` |

### Categories

| Method & path | Request | Response |
|---|---|---|
| `GET /front/categories` | — (see note) | `CategoryListDto { items: CategoryDto[], canAdd }` |
| `POST /front/categories` | `EditCategoryDto { name }` | `integer` (new id) |
| `GET /front/categories/{id}` | path `id: int` | `CategoryDto` |
| `POST /front/categories/{id}` | path `id: int`, `EditCategoryDto { name }` | `200` (no content) |
| `DELETE /front/categories/{id}` | path `id: int` | `200` (no content) |
| `GET /front/categories/name-exists` | query `id?: int`, `name: string` (required) | `boolean` |

### DTOs (exact shapes from the spec)

```
LogonRequestDto      { login: string, password: string }            // both required
LogonResponseDto     { token: string, refreshToken: string, user: CurrentUserDto }
RefreshTokenRequestDto { refreshToken: string }
TokensResponseDto    { token: string, refreshToken: string }
CurrentUserDto       { displayName: string, timezoneOffset: string /*date-span*/, permissions: CurrentUserPermissions }
CategoryListDto      { items: CategoryDto[], canAdd: boolean }       // no total, no "hasMore"
CategoryDto          { id: int32, name: string, canEdit: boolean, canDelete: boolean }
EditCategoryDto      { name: string }
```

### name-exists semantics

`GET /front/categories/name-exists?id={current|null}&name={value}` → `true` means
the name is **taken** ⇒ the Name field is **invalid**. `id` is the current record's
id when editing, omitted/null when adding. Debounced async validator on the field.

## Behaviors

### Listing, search, sort — **client-side** (backend limitation)

The brief describes server-side paging (`pageNumber` from 0 until a short page),
`search`, and `sortDesc`. **The live backend does not implement them**: verified
that `GET /front/categories` ignores `pageNumber` / `pageSize` / `search` /
`sortDesc` (any casing, plus `skip`/`take`) and always returns the full list in a
fixed order. `CategoryListDto` carries no `total` and no "has more" flag.

Decision (see [decisions.md](decisions.md#d1)): the generated client still **sends**
`search` / `sortDesc` / `pageNumber` (faithful to the brief and future-proof if the
backend gains support), but **search, sort, and virtual scroll are performed
client-side** over the full list. CDK virtual scroll renders only the visible rows,
so a full list stays performant.

### Async name validation

Required + debounced async validator calling `name-exists`. Invalid when the server
returns `true` (name taken).

### Permissions

- List: `canAdd` gates **+ Add**.
- Row: `canEdit` gates edit/navigation affordance; `canDelete` gates the delete icon.
- Record: `canEdit=false` ⇒ read-only dialog, **Save** hidden.

### Auth & tokens

- `token` + `refreshToken` in **localStorage**; session restored on reload.
- Functional auth guard protects `/categories*`; unauthenticated → `/login`.
- HTTP interceptor attaches the bearer token; on `401` it transparently calls
  `refresh-token`, retries once, and logs out on refresh failure.
- Logout (rail icon) clears tokens → `/login`.

## Design vs data

The Figma mockups are **generic across all references** ("Макеты обобщённые для всех
справочников, у каждого конкретного справочника свои поля"). Two adaptations for
categories:

1. **Columns:** the design shows generic `Name` / `Description`; the categories
   reference uses **`Id`** + **`Name`** (per the brief; `CategoryDto` has no
   `description`).
2. **Dialog fields:** the generic modal shows two inputs; categories has only
   **Name** (editable) — `EditCategoryDto` is `{ name }`. The Id is shown in the list,
   not the dialog.

## Testing

- **Visual regression (gate):** Playwright screenshot diff at a fixed 1920×1080
  viewport; committed baselines are the source of truth.
- **Design fidelity (qualitative):** compare against Figma frames (not an automated
  gate — different renderers). Reference screenshots kept local (gitignored).
