-- backend/sql/init.sql
-- Full schema: users, drones, articles, gallery, inquiries, testimonials, favorites,
-- campaign_links, activity_events, newsletter_subscribers

-- ============================================================
-- RESET (safe to re-run — drops old tables from earlier versions)
-- ============================================================
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS activity_events CASCADE;
DROP TABLE IF EXISTS campaign_links CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS drone_reviews CASCADE; -- pre-pivot name
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS gallery_items CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS drones CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS firms CASCADE; -- pre-pivot table, no longer created

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
    referral_source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DRONES  (hybrid spec storage: fixed columns + flexible extras)
-- ============================================================
CREATE TABLE drones (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subcategory TEXT CHECK (subcategory IN ('rescue', 'police', 'medical')),
    description TEXT,
    wingspan_mm INTEGER,
    weight_kg NUMERIC(6, 2),
    flight_time_min INTEGER,
    range_km NUMERIC(7, 2),
    max_speed_kmh NUMERIC(6, 2),
    payload_kg NUMERIC(6, 2),
    extra_specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    primary_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_drones_subcategory ON drones(subcategory);

-- ============================================================
-- ARTICLES
-- ============================================================
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    body TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    featured_image_url TEXT,
    related_drone_id INTEGER REFERENCES drones(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_status ON articles(status);

-- ============================================================
-- GALLERY ITEMS
-- ============================================================
CREATE TABLE gallery_items (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video')),
    category TEXT,
    drone_id INTEGER REFERENCES drones(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gallery_items_drone_id ON gallery_items(drone_id);

-- ============================================================
-- INQUIRIES  ("request pricing / a demo for a drone")
-- ============================================================
CREATE TABLE inquiries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    drone_id INTEGER REFERENCES drones(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_drone_id ON inquiries(drone_id);

-- ============================================================
-- TESTIMONIALS  (curated case studies, admin/editor authored)
-- ============================================================
CREATE TABLE testimonials (
    id SERIAL PRIMARY KEY,
    drone_id INTEGER NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
    agency_name TEXT NOT NULL,
    contact_title TEXT,
    quote TEXT NOT NULL,
    outcome TEXT,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_testimonials_drone_id ON testimonials(drone_id);

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('drone', 'article')),
    item_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- ============================================================
-- CAMPAIGN LINKS  (per-channel tracked redirects, e.g. /r/:slug)
-- ============================================================
CREATE TABLE campaign_links (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL CHECK (platform IN ('youtube', 'facebook', 'instagram')),
    destination_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ACTIVITY EVENTS  (view/click tracking, logged-in or anonymous)
-- ============================================================
CREATE TABLE activity_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    anon_id TEXT,
    event_type TEXT NOT NULL,
    target_type TEXT,
    target_id INTEGER,
    referral_source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_events_user_id ON activity_events(user_id);
CREATE INDEX idx_activity_events_event_type ON activity_events(event_type);
CREATE INDEX idx_activity_events_target ON activity_events(target_type, target_id);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS  (standalone — no account required)
-- ============================================================
CREATE TABLE newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    referral_source TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_newsletter_subscribers_user_id ON newsletter_subscribers(user_id);
