PRAGMA foreign_keys = ON;

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);
INSERT INTO categories (id, name, slug, sort_order) VALUES
 ('carpet','Carpet','carpet',10),
 ('carpet-tiles','Carpet Tiles','carpet-tiles',20),
 ('engineered-hardwood','Engineered Hardwood','engineered-hardwood',30),
 ('laminate','Laminate Flooring','laminate',40),
 ('solid-hardwood','Solid Hardwood','solid-hardwood',50),
 ('vinyl','Vinyl Flooring','vinyl',60),
 ('tiles','Tiles','tiles',70),
 ('accessories','Accessories','accessories',80);

CREATE TABLE media (
 id TEXT PRIMARY KEY,
 object_key TEXT NOT NULL UNIQUE,
 mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp')),
 size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
 filename TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE products (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 120),
 category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
 description TEXT NOT NULL DEFAULT '' CHECK(length(description) <= 5000),
 price_cents INTEGER CHECK(price_cents BETWEEN 0 AND 100000000),
 price_unit TEXT NOT NULL DEFAULT '' CHECK(price_unit IN ('','per sq. ft.','per item','per box')),
 featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0,1)),
 published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)),
 image_id TEXT REFERENCES media(id) ON DELETE RESTRICT,
 image_alt TEXT NOT NULL DEFAULT '' CHECK(length(image_alt) <= 250),
 version INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE gallery (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
 description TEXT NOT NULL DEFAULT '' CHECK(length(description) <= 5000),
 image_id TEXT NOT NULL REFERENCES media(id) ON DELETE RESTRICT,
 image_alt TEXT NOT NULL CHECK(length(image_alt) BETWEEN 1 AND 250),
 sort_order INTEGER NOT NULL DEFAULT 0 CHECK(sort_order BETWEEN 0 AND 9999),
 published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)),
 version INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX products_public ON products(published,featured,created_at);
CREATE INDEX products_category ON products(category_id,published);
CREATE INDEX products_image ON products(image_id);
CREATE INDEX gallery_public ON gallery(published,sort_order,created_at);
CREATE INDEX gallery_image ON gallery(image_id);
