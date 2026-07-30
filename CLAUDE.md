# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A marketing/campaign site for fixed-wing VTOL drones (`#PunctulDeZbor`), focused on BraveX Aero's intervention use case — rescue, police, and medical/ambulance drones only (agriculture and the earlier manufacturer-directory concept are out of scope). Includes a drone catalog, articles, a gallery, quote-only inquiries, curated testimonials, favorites, a newsletter, and campaign-link click tracking. Three independent npm packages, no monorepo tooling (no workspaces, no shared root scripts) — each must be installed and run separately.

## Repo layout — read this before touching the frontend

- `backend/` — Express + PostgreSQL API.
- `debug-frontend/` — **this is the real, actively developed frontend.** Despite the name, it has full routing, auth, and pages wired to the API.
- `frontend/` — an unmodified `create-vite` React scaffold (still has the default counter demo in `App.jsx`). It has never been built out and has no routes, API client, or components beyond the template. Unless a task explicitly says to build out `frontend/`, assume UI work belongs in `debug-frontend/`.

## Commands

Run each package's commands from within its own directory (`backend/`, `debug-frontend/`, `frontend/`).

**Backend** (`backend/`):
- `npm run dev` — start API with nodemon (auto-reload), reads `backend/.env`
- `npm start` — start API without reload
- `npm run seed` — wipe and reseed all tables (`src/seed.js`); prints the shared seed-user password to stdout
- No test suite or lint script currently configured.

**Frontend** (`debug-frontend/` or `frontend/`):
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — oxlint (config in `.oxlintrc.json`)
- `npm run preview` — preview a production build

There's no root-level install/build — `npm install` must be run in each of `backend/`, `debug-frontend/`, and `frontend/` independently.

## Backend architecture

- `src/index.js` — Express app entry. Mounts one router per resource under `/api/*`; no versioning. Also defines a top-level `GET /r/:slug` (deliberately outside `/api`, so campaign links stay short) that logs a hit to `activity_events` and 302-redirects to `${FRONTEND_URL}${destination_path}?ref=<slug>`.
- `src/db.js` — single shared `pg` `Pool`, exported directly (no query-builder/ORM). Connection string comes from `DATABASE_URL` / `POSTGRES_URL` / `PG_CONNECTION_STRING` (first one set wins). SSL is only enabled when `PGSSL=true` or `NODE_ENV=production`.
- `src/middleware/auth.js` — three middlewares built around a JWT signed with `{ id, role }` (no expiry set on the token):
  - `authenticate` — requires a valid Bearer token, sets `req.user` from the JWT payload (not a fresh DB read).
  - `optionalAuthenticate` — same, but continues with `req.user = null` on missing/invalid token instead of rejecting.
  - `authorize(...roles)` — gate by `req.user.role`; must run after `authenticate`.
- `src/routes/*.js` — one file per resource (`auth`, `drones`, `testimonials`, `articles`, `gallery`, `inquiries`, `favorites`, `landing`, `newsletter`, `campaign-links`, `activity`). Routes build parameterized SQL by hand (conditions/values arrays pushed in order) rather than using a query builder — follow that pattern when adding filters.
- `src/content.js` — static marketing copy (hero text, benefits) served as-is by `GET /api/landing`; edit here for landing-page copy changes, not in a route file.
- `src/seed.js` — deterministic demo dataset (8 users incl. one admin/one editor, 5 drones covering BraveX's real model lineup reframed into rescue/police/medical subcategories, articles, gallery items, inquiries, testimonials, favorites, campaign links, newsletter subscribers, activity events), truncates and restarts identity on every run. All seeded users share one password, printed by the script.

**Authorization model** (role column on `users`: `admin`, `editor`, `user` — no `firm_owner`):
- `admin` — unrestricted; the only role that can create/edit drones or manage inquiries (view-all, update status).
- `editor` — can author/edit their own articles; `admin` and `editor` jointly manage gallery items and testimonials.
- `user` — default role on signup; no longer has a path to another role (firm registration, and the `user` → `firm_owner` promotion it used to trigger, is gone).
- Ownership checks are done per-route (e.g. `articles.js` re-derives `isAdmin`/`isAuthor` from `req.user` vs. the fetched row) — there's no shared ownership-check helper, so replicate the existing per-route pattern rather than introducing a new abstraction.

**Schema** (`backend/sql/init.sql`, run manually against Postgres — no migration tool): `users` (role: `admin`/`editor`/`user`; nullable `referral_source`, captured at signup) → `drones` (hybrid spec storage: fixed numeric columns like `wingspan_mm`/`range_km` plus a free-form `extra_specs` JSONB; `subcategory` — `rescue`/`police`/`medical` — replaces the old `category`; no `price` column, this is a quote-only catalog) → `articles`, `gallery_items`, `inquiries` (just `user_id`/`drone_id`/`message`/`status`, no firm association), `testimonials` (curated case studies — `agency_name`/`contact_title`/`quote`/`outcome`/`featured` — admin/editor-authored, replaces the old user-submitted `drone_reviews`), `favorites` (polymorphic via `item_type` + `item_id`, no FK — see `TABLE_BY_TYPE` map in `routes/favorites.js` for the type→table wiring; `item_type` is `drone`/`article` only now). Plus three standalone tracking tables: `campaign_links` (per-channel redirects served at `/r/:slug`), `activity_events` (view/favorite/click logging, logged-in or anonymous via `anon_id`), `newsletter_subscribers`.

## Frontend architecture (`debug-frontend/`)

- `src/api.js` — single fetch wrapper (`request`) that injects the JWT from `localStorage` and normalizes errors; every backend call is a thin exported function here. Add new endpoints here rather than calling `fetch` from components/pages.
- `src/context/AuthContext.jsx` — `AuthProvider`/`useAuth()`; owns the token lifecycle (localStorage), hydrates `user` via `GET /api/auth/me` on load; `signup()` attaches `referral_source` automatically via `src/referral.js`, invisibly to the caller.
- `src/referral.js` — `captureReferralSource()` reads a `?ref=` query param into `localStorage` (called once from `App.jsx` on mount); `getReferralSource()` reads it back for signup and the newsletter form. There's no visible "referred by" UI — this is silent attribution.
- `src/App.jsx` — route table (`react-router-dom` v7), one page per resource under `src/pages/`, persistent `Nav`/`Footer` shell.
- `src/components/` — presentational cards (`DroneCard`, `ArticleCard`, `GalleryCard`) plus `Nav`, `Footer`, `BrandLogo`.
- Styling is Tailwind v4 via `@tailwindcss/vite` (no `tailwind.config.js` — v4 uses CSS-based config in `index.css`).
- `VITE_API_URL` (in `.env`) points at the backend; defaults to `http://localhost:4000` if unset.
