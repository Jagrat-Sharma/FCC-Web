CREATE TABLE blogs (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
 description TEXT NOT NULL DEFAULT '' CHECK(length(description) <= 5000),
 content TEXT NOT NULL CHECK(length(content) BETWEEN 1 AND 30000),
 image_id TEXT REFERENCES media(id) ON DELETE RESTRICT,
 image_alt TEXT NOT NULL DEFAULT '',
 published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)),
 version INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX blogs_public ON blogs(published, created_at);
CREATE INDEX blogs_image ON blogs(image_id);
