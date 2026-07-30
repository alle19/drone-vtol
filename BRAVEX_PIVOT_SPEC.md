# BraveX Intervention Pivot — Implementation Spec

## Project framing (context for Claude Code, not a code change)

- Independent marketing/product concept project built for a real challenge posed by
  BraveX Aero (Cluj-Napoca, Romania) through a partner program. Presented to BraveX on
  demo day. Not affiliated with BraveX, not using their real accounts/data/socials.
- Focus narrows to BraveX's intervention use case only: rescue, police, ambulance/medical.
  Agriculture is dropped entirely — this is not a multi-category marketplace anymore.
- Drone catalog should reflect BraveX's real lineup conceptually: five models covering
  a rescue-focused VTOL, a police/patrol platform, a medical/ambulance flagship, and one
  or two others. Re-verify exact naming/specs before finalizing rather than trusting old
  notes — treat real-world facts about BraveX as something to confirm fresh, not assume.
- Primary social channels: YouTube, Facebook, Instagram.

## Schema changes

### Remove
- `firms` table — dropped entirely.
- `firm_owner` from the `users.role` check constraint.
- `drones.firm_id`, `articles.related_firm_id`, `gallery_items.firm_id`, `inquiries.firm_id`.
- `drones.price` — no public pricing; quote-only model via inquiries.
- `'firm'` as a valid `favorites.item_type`.

### Modify
- `users.role` CHECK constraint → `('admin', 'editor', 'user')` only.
- `drones.category` → repurpose/rename to `subcategory`, values:
  `rescue`, `police`, `medical`, `firefighting`.
- `drone_reviews` → restructure into `testimonials`:
  `id, drone_id, agency_name, contact_title, quote, outcome, featured, created_at`.
  Written by `admin`/`editor` only — not open to the `user` role. These are curated
  case studies ("Cascade County Search & Rescue says...") not open star ratings.

### Add
- `users.referral_source` (nullable text), captured at signup.
- `campaign_links`: `id, slug (unique), platform (youtube/facebook/instagram),
  destination_path, created_at`. A visit to `/r/:slug` logs the hit and redirects to
  `destination_path`.
- `activity_events`: `id, user_id (nullable), anon_id (nullable), event_type,
  target_type, target_id, referral_source (nullable), created_at`. Single table for
  all view/click tracking, logged-in or anonymous.
- `newsletter_subscribers`: `id, email (unique), referral_source (nullable),
  user_id (nullable), subscribed_at`. Standalone — subscribing shouldn't require
  a full account.

## Backend route changes

- Delete `routes/firms.js` entirely.
- `routes/drones.js` — remove firm fields/ownership checks, remove `price`, filter by
  `subcategory` instead of `category`.
- `routes/drone-reviews.js` → rename to `routes/testimonials.js`; writes gated to
  `admin`/`editor`, not any authenticated user.
- `routes/articles.js`, `routes/gallery.js`, `routes/inquiries.js` — remove all firm
  references and firm-owner permission branches.
- New: `routes/newsletter.js` (subscribe/unsubscribe), `routes/campaign-links.js`
  (admin CRUD + the public redirect-and-log route), `routes/activity.js` (event
  logging endpoint + admin-only stats aggregation: subscriber counts, most-viewed/
  favorited drones, signups by campaign link, inquiry volume).
- `middleware/auth.js` — `authorize()` no longer needs `firm_owner` in its role set;
  ownership-check pattern (per-route, not shared) stays as-is per existing convention.

## Reseed (`src/seed.js`)

Full rewrite: BraveX's real model lineup (re-verify names/specs), subcategories
rescue/police/medical/firefighting, curated testimonials from plausible fictional
agencies (not open reviews), a handful of campaign links, a few newsletter
subscribers and activity events for demo-day realism.

## Frontend (`debug-frontend/` — the real, kept frontend)

- Remove firms pages, nav links, and any firm-owner-only UI.
- Drone browsing/detail: subcategory instead of category, no public price, "Request
  pricing" / "Request a demo" CTA instead, testimonials section instead of reviews
  (read-only display; no user-facing "submit a review" form since only admin/editor
  create these).
- Add newsletter signup UI (footer or dedicated section).
- Handle referral capture: read a campaign-link redirect or `?ref=` param client-side,
  persist through to signup so `users.referral_source` gets set correctly.

## Explicitly NOT decided yet — do not implement without asking first

- Exact model-to-subcategory mapping for the real BraveX lineup.
- Whether to build the "For Police / For Rescue / For EMS" audience-split landing
  pages, or a response-time comparison feature — these were brainstormed ideas, not
  commitments.
- Any specific BraveX facts/specs not already reconfirmed — verify before hardcoding.
