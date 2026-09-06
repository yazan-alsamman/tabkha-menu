CREATE TABLE IF NOT EXISTS restaurants (
  id text PRIMARY KEY,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  tagline_ar text NOT NULL,
  tagline_en text NOT NULL,
  story_ar text NOT NULL,
  story_en text NOT NULL,
  logo text NOT NULL,
  currency text NOT NULL DEFAULT 'AED',
  currency_label_ar text NOT NULL DEFAULT 'درهم',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS address_ar text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS address_en text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS default_locale text NOT NULL DEFAULT 'ar';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS qr_url text;

CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  restaurant_id text NOT NULL REFERENCES restaurants(id),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text,
  description_en text,
  image text,
  display_order integer NOT NULL,
  surface text NOT NULL DEFAULT 'cream',
  script_accent text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_by text;

CREATE TABLE IF NOT EXISTS menu_items (
  id text PRIMARY KEY,
  category_id text NOT NULL REFERENCES categories(id),
  name_ar text NOT NULL,
  name_en text,
  description_ar text,
  description_en text,
  price numeric(10, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'AED',
  image text,
  display_order integer NOT NULL,
  portion_note text,
  featured boolean NOT NULL DEFAULT false,
  available boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  dietary_tags text,
  allergens text,
  spicy_level integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_by text;

CREATE TABLE IF NOT EXISTS settings (
  id text PRIMARY KEY,
  restaurant_id text NOT NULL REFERENCES restaurants(id),
  key text NOT NULL,
  value text NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restaurant_users (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id text PRIMARY KEY,
  restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  kind text NOT NULL,
  storage_key text NOT NULL,
  url text NOT NULL,
  mime text,
  width integer,
  height integer,
  size_bytes integer,
  alt_ar text,
  alt_en text,
  variants jsonb,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE UNIQUE INDEX IF NOT EXISTS restaurant_users_unique_idx ON restaurant_users (user_id, restaurant_id);
CREATE UNIQUE INDEX IF NOT EXISTS settings_restaurant_key_idx ON settings (restaurant_id, key);
CREATE INDEX IF NOT EXISTS categories_restaurant_order_idx ON categories (restaurant_id, display_order);
CREATE INDEX IF NOT EXISTS categories_restaurant_published_idx ON categories (restaurant_id, published);
CREATE INDEX IF NOT EXISTS menu_items_category_order_idx ON menu_items (category_id, display_order);
CREATE INDEX IF NOT EXISTS menu_items_published_idx ON menu_items (published, available);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);
CREATE INDEX IF NOT EXISTS media_restaurant_kind_idx ON media (restaurant_id, kind);
