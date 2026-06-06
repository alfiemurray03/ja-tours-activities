CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_pence INTEGER NOT NULL CHECK (price_pence >= 0),
  delivery TEXT NOT NULL,
  features_json TEXT NOT NULL DEFAULT '[]',
  published INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  version TEXT NOT NULL DEFAULT '1.0',
  published_at TEXT,
  updated_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stripe_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  processed INTEGER NOT NULL DEFAULT 0 CHECK (processed IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO services (slug, name, description, price_pence, delivery, features_json, published, featured, sort_order) VALUES
('destination-research-pack', 'Destination Research Pack', 'A practical introduction to your chosen destination, including areas, arrival notes, local transport and activity ideas.', 4900, 'Estimated delivery: 3–5 working days', '["Destination and area overview","Arrival and local transport notes","Activity and practical planning ideas"]', 1, 0, 1),
('mini-itinerary', 'Mini Itinerary', 'A clear one-to-three-day itinerary outline with a sensible route, suggested activities and practical travel notes.', 5900, 'Estimated delivery: 3–5 working days', '["Morning, afternoon and evening ideas","Suggested route and daily flow","Local transport considerations"]', 1, 0, 2),
('full-trip-planning-pack', 'Full Trip Planning Pack', 'Our most complete service, bringing destination research, area guidance, activities and an itinerary outline together.', 14900, 'Estimated delivery: 5–10 working days', '["Destination and area research","Activity shortlist and transport notes","Itinerary outline and pre-travel checklist"]', 1, 1, 3),
('activity-shortlist', 'Activity Shortlist', 'A curated shortlist of attractions, experiences and things to do based on your destination and interests.', 3900, 'Estimated delivery: 2–4 working days', '["Ideas grouped around your interests","Location and suitability notes","Selected third-party provider links"]', 1, 0, 4),
('accommodation-area-guide', 'Accommodation Area Guide', 'A comparison of suitable neighbourhoods or areas to help you choose where to make your own accommodation booking.', 4900, 'Estimated delivery: 3–5 working days', '["Area character and comparison","Transport and location considerations","Guidance based on your preferences"]', 1, 0, 5);
