-- backend/sql/init.sql
-- Full schema: users, firms, drones, articles, gallery, inquiries, reviews, favorites

-- ============================================================
-- RESET (safe to re-run — drops old tables from earlier versions)
-- ============================================================
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS drone_reviews CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS gallery_items CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS drones CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS firms CASCADE;

-- ============================================================
-- FIRMS
-- ============================================================
CREATE TABLE firms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    location TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'firm_owner', 'user')),
    firm_id INTEGER REFERENCES firms(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_firm_id ON users(firm_id);

-- ============================================================
-- DRONES  (hybrid spec storage: fixed columns + flexible extras)
-- ============================================================
CREATE TABLE drones (
    id SERIAL PRIMARY KEY,
    firm_id INTEGER NOT NULL REFERENCES firms(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    price NUMERIC(10, 2),
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

CREATE INDEX idx_drones_firm_id ON drones(firm_id);
CREATE INDEX idx_drones_category ON drones(category);

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
    related_firm_id INTEGER REFERENCES firms(id) ON DELETE SET NULL,
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
    firm_id INTEGER REFERENCES firms(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gallery_items_drone_id ON gallery_items(drone_id);
CREATE INDEX idx_gallery_items_firm_id ON gallery_items(firm_id);

-- ============================================================
-- INQUIRIES  ("contact a firm")
-- ============================================================
CREATE TABLE inquiries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    firm_id INTEGER NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    drone_id INTEGER REFERENCES drones(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_firm_id ON inquiries(firm_id);
CREATE INDEX idx_inquiries_drone_id ON inquiries(drone_id);

-- ============================================================
-- DRONE REVIEWS
-- ============================================================
CREATE TABLE drone_reviews (
    id SERIAL PRIMARY KEY,
    drone_id INTEGER NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (drone_id, user_id)
);

CREATE INDEX idx_drone_reviews_drone_id ON drone_reviews(drone_id);

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('drone', 'article', 'firm')),
    item_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);

