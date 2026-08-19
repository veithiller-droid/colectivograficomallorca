CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0,
  bio_de TEXT, bio_es TEXT, active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, artist_id TEXT NOT NULL REFERENCES artists(id),
  title TEXT NOT NULL, description_de TEXT, description_es TEXT, active BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE, sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS product_images (
  id BIGSERIAL PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('primary','room')), path TEXT NOT NULL,
  room_code TEXT, shown_format TEXT, sort_order INTEGER NOT NULL DEFAULT 0, UNIQUE(product_id,path)
);
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS image_data BYTEA;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS original_name TEXT;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS product_formats (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('A6','A4','A3','A2')),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0), available BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY(product_id,format)
);
CREATE TABLE IF NOT EXISTS frame_options (
  id TEXT PRIMARY KEY, name_de TEXT NOT NULL, name_es TEXT NOT NULL, material TEXT NOT NULL,
  glazing TEXT NOT NULL, color TEXT, custom_made BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS frame_prices (
  frame_id TEXT NOT NULL REFERENCES frame_options(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('A4','A3','A2')),
  surcharge_cents INTEGER NOT NULL CHECK (surcharge_cents >= 0), PRIMARY KEY(frame_id,format)
);
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE, locale TEXT NOT NULL DEFAULT 'de',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','subscribed','unsubscribed')),
  consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), confirmed_at TIMESTAMPTZ, unsubscribed_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, stripe_checkout_session_id TEXT UNIQUE, stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', currency TEXT NOT NULL DEFAULT 'eur',
  total_cents INTEGER NOT NULL DEFAULT 0, customer_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_note TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS orders_fulfillment_idx ON orders(fulfillment_status,created_at DESC);
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id), product_title TEXT NOT NULL, format TEXT NOT NULL,
  frame_id TEXT REFERENCES frame_options(id), quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK(unit_price_cents >= 0)
);
CREATE TABLE IF NOT EXISTS import_runs (
  id BIGSERIAL PRIMARY KEY, source TEXT NOT NULL, product_count INTEGER NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS products_artist_idx ON products(artist_id,sort_order);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images(product_id,sort_order);
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;
