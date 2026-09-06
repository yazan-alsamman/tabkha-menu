import {
  pgTable,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const restaurants = pgTable("restaurants", {
  id: text("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  taglineAr: text("tagline_ar").notNull(),
  taglineEn: text("tagline_en").notNull(),
  storyAr: text("story_ar").notNull(),
  storyEn: text("story_en").notNull(),
  logo: text("logo").notNull(),
  currency: text("currency").notNull().default("AED"),
  currencyLabelAr: text("currency_label_ar").notNull().default("درهم"),
  phone: text("phone"),
  instagram: text("instagram"),
  addressAr: text("address_ar"),
  addressEn: text("address_en"),
  defaultLocale: text("default_locale").notNull().default("ar"),
  qrUrl: text("qr_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey(),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en").notNull(),
    descriptionAr: text("description_ar"),
    descriptionEn: text("description_en"),
    image: text("image"),
    displayOrder: integer("display_order").notNull(),
    surface: text("surface").notNull().default("cream"),
    scriptAccent: text("script_accent"),
    active: boolean("active").notNull().default(true),
    published: boolean("published").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    needsReview: boolean("needs_review").notNull().default(false),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("categories_restaurant_order_idx").on(table.restaurantId, table.displayOrder),
    index("categories_restaurant_published_idx").on(table.restaurantId, table.published),
  ],
);

export const menuItems = pgTable(
  "menu_items",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en"),
    descriptionAr: text("description_ar"),
    descriptionEn: text("description_en"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("AED"),
    image: text("image"),
    displayOrder: integer("display_order").notNull(),
    portionNote: text("portion_note"),
    featured: boolean("featured").notNull().default(false),
    available: boolean("available").notNull().default(true),
    active: boolean("active").notNull().default(true),
    published: boolean("published").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    needsReview: boolean("needs_review").notNull().default(false),
    dietaryTags: text("dietary_tags"),
    allergens: text("allergens"),
    spicyLevel: integer("spicy_level"),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("menu_items_category_order_idx").on(table.categoryId, table.displayOrder),
    index("menu_items_published_idx").on(table.published, table.available),
  ],
);

export const settings = pgTable(
  "settings",
  {
    id: text("id").primaryKey(),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurants.id),
    key: text("key").notNull(),
    value: text("value").notNull(),
  },
  (table) => [uniqueIndex("settings_restaurant_key_idx").on(table.restaurantId, table.key)],
);

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const restaurantUsers = pgTable(
  "restaurant_users",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("restaurant_users_unique_idx").on(table.userId, table.restaurantId)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sessions_user_idx").on(table.userId),
    index("sessions_expires_idx").on(table.expiresAt),
  ],
);

export const media = pgTable(
  "media",
  {
    id: text("id").primaryKey(),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    storageKey: text("storage_key").notNull(),
    url: text("url").notNull(),
    mime: text("mime"),
    width: integer("width"),
    height: integer("height"),
    sizeBytes: integer("size_bytes"),
    altAr: text("alt_ar"),
    altEn: text("alt_en"),
    variants: jsonb("variants").$type<Record<string, string>>(),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("media_restaurant_kind_idx").on(table.restaurantId, table.kind)],
);
