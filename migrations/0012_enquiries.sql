CREATE TABLE enquiries (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 email TEXT NOT NULL,
 phone TEXT NOT NULL DEFAULT '',
 material TEXT NOT NULL,
 details TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New','Contacted','Closed')),
 notification_status TEXT NOT NULL DEFAULT 'pending' CHECK(notification_status IN ('pending','sending','sent','failed')),
 notification_started INTEGER,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX enquiries_created ON enquiries(created_at DESC);
CREATE TABLE contact_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
