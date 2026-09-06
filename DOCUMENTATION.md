# Tabkha and More — Digital Menu Documentation

Complete record of what was built for **طبخة آند مور (Tabkha and More)**: a premium bilingual digital restaurant menu plus a restaurant-owned menu CMS.

Related files:

- [README.md](README.md) — install, scripts, deploy
- [CONTENT_REVIEW.md](CONTENT_REVIEW.md) — source discrepancies that must not be “fixed” silently

---

## 1. Product

This is not a PDF converted to HTML and not a generic restaurant template. It is an interactive brand experience:

1. Guest scans a QR code at the table.
2. The branded hero loads immediately (Arabic by default).
3. Categories are one tap away.
4. Dishes appear with prices in درهم (AED).
5. Language switches Arabic RTL ↔ English LTR and is remembered.

**Live local URLs**

| Surface | URL |
| --- | --- |
| Arabic menu | `http://localhost:5173/ar` |
| English menu | `http://localhost:5173/en` |
| Restaurant CMS | `http://localhost:5173/admin` |
| API | `http://127.0.0.1:8787` |

`/` redirects to the last chosen locale (`localStorage`), default `ar`.

---

## 2. Source of truth

The contract folder was named `Friends`; the workspace uses **`referenses/`**.

| File | Role |
| --- | --- |
| `Restaurant Facade Logo2.pdf` | Vector wordmarks and four-petal mark |
| `Tabkha and More.pdf` | Brand book (palette, story, pattern) |
| `tabkha & more.pdf` | 9-page printed menu (raster; Arabic + price are authoritative) |

Nothing visual or culinary was invented when the PDFs already defined it. Ambiguous English wrapping in the printed menu is listed in `CONTENT_REVIEW.md`.

---

## 3. Brand system

### Colours (`src/styles/tokens.css`)

| Token | Hex | Use |
| --- | --- | --- |
| Forest | `#233025` | Hero, nav, dark sections |
| Forest deep | `#1A241C` | Footer |
| Cream | `#EDDFCE` | Menu paper, light sections |
| Terracotta | `#9B6A51` | Price, active chip, accents |
| Sage | `#959588` | Secondary text, glyphs |

### Logo and graphics

- **Petal mark** — 2×2 rounded petals with a star as negative space (`PetalMark`, SVG paths from the facade artwork)
- **Wordmarks** — Arabic and Latin, masked from extracted SVGs in `public/brand/`
- **Glyph field** — rotated «طبخة» marks used as atmosphere, not decoration from a stock pack
- **Arch divider** — terracotta line + oval from the printed menu language

### Type

- Latin: **Montserrat** (self-hosted `@fontsource`)
- Arabic: **Cairo** (stand-in; brand book specifies DIN Next LT Arabic, which is commercial)

### Motion tokens

- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Durations: 180ms / 420ms / 780ms
- `prefers-reduced-motion` disables looping animation and smooth scroll

---

## 4. Stack

| Layer | Choice | Why |
| --- | --- | --- |
| UI | React 19 + TypeScript + Vite 7 | Fast QR first paint, typed components |
| Style | Tailwind CSS v4 | Tokens in `@theme`, no scattered hex |
| Motion | Motion (Framer Motion) | CSS 3D + scroll, no WebGL payload |
| Routing | React Router | `/ar` and `/en` with persisted locale |
| Server state | TanStack Query | Cache + stale-while-revalidate |
| API | Hono | Tiny REST on Vercel |
| Database | Neon Postgres (Frankfurt `aws-eu-central-1`) | Managed Postgres, serverless |
| ORM | Drizzle | Schema that can grow into an admin later |
| Validation | Zod | API params |
| QR | `qrcode` | Branded table-tent panel |
| CI | GitHub Actions | install → typecheck → lint → test → build |
| Host | Vercel | Frontend + `/api` rewrite |

CSS 3D was chosen over Three.js so a restaurant QR load stays light.

---

## 5. Architecture

```
QR / browser
    → Vite React app  (/ar | /en)   guest menu
    → Vite React app  (/admin)      lazy CMS
        → TanStack Query
            → Hono
                → Neon Postgres + object storage
            → fallback: src/data/generated/menu.json  (guest only)
```

If the API or database is down, the UI still shows the full menu from the seed snapshot. A QR scan never becomes a blank screen.

### Routes

| Path | Behaviour |
| --- | --- |
| `/` | Redirect to stored locale |
| `/:locale` | Guest menu (`ar` or `en`) |
| `/admin` | Restaurant CMS (login + dashboard) |
| `/api/*` | Hono (see §8 and §21) |

---

## 6. Repository layout

```
api/                 Hono app (Vercel + local tsx server)
db/                  Drizzle schema, migrate, seed, init.sql
public/brand/        Petal mark + wordmark + glyph SVGs
public/images/categories/   Category heroes (WebP 480 / 900 / 1400)
scripts/             PDF extract + hero photo ingest
src/components/animations/  Scene3D, PetalMark3D, Atmosphere
src/components/branding/    Hero, GlyphField, QR, story, footer, loader
src/components/menu/        Sections, cards, sheet, photos, price
src/components/navigation/  CategoryNav, language, scroll progress
src/data/            menu.seed.ts, copy, generated JSON
src/hooks/           useMenu, useActiveCategory, useSceneTilt
src/lib/             i18n, locale, images, format
src/pages/           MenuPage
src/services/        fetchMenu
src/styles/          tokens.css
.github/workflows/   CI
vercel.json          SPA + API rewrite
```

---

## 7. Data model

Designed so restaurant staff edit the menu in `/admin` without changing React. The print-menu seed is the initial catalog only.

### Restaurant

id, names, taglines, story (AR/EN), logo, currency `AED`, `currency_label_ar` = درهم

### Categories (14)

id, restaurant_id, names, optional descriptions, image slug, display_order, surface (`cream` | `forest`), script_accent, active

| Order | id | Arabic | English | Surface |
| --- | --- | --- | --- | --- |
| 1 | breakfast | الإفطار | Breakfast | cream |
| 2 | soups | الشوربات | Soups | cream |
| 3 | salads-east | السلطات الشرقية | Salads East | cream |
| 4 | doughs | المعجنات | Doughs | cream |
| 5 | cold-appetizers | المقبلات الباردة | Cold Appetizers | cream |
| 6 | hot-appetizers | المقبلات الساخنة | Hot Appetizers | cream |
| 7 | hot-dishes-eastern | الأطباق الساخنة الشرقية | Hot Dishes Eastern | cream |
| 8 | hot-dishes-western | الأطباق الساخنة الغربية | Hot Dishes Western | cream |
| 9 | pizza | البيتزا | Pizza | cream |
| 10 | pasta | الباستا | Pasta | cream |
| 11 | sandwich-eastern | السندويش الشرقي | Eastern Sandwich | forest |
| 12 | sandwich-western | السندويش الغربي | Western Sandwich | forest |
| 13 | grills | المشاوي | Grills | forest |
| 14 | daily-dish | طبق اليوم | Daily Dish | forest |

### Menu items (~131)

id, category_id, names (English nullable), descriptions, price, currency, image (unused — no per-dish photos in the print), display_order, portion_note, featured, available, active, plus future columns: dietary_tags, allergens, spicy_level

### Auth, media, publishing

| Table | Role |
| --- | --- |
| `users` | Staff accounts (email + scrypt password hash) |
| `restaurant_users` | User ↔ restaurant membership and role (`owner` / `editor`) |
| `sessions` | Hashed session tokens with expiry |
| `media` | Image metadata and variant URLs (files live in Blob or `uploads/`) |

Categories and dishes gained `published`, `published_at`, `needs_review`, and `updated_by`. Guests only see published + available rows. Seeded print-menu content starts published.

### Settings

key/value per restaurant (QR URL, default locale, etc. later)

---

## 8. API

Base path `/api`. CORS enabled. Menu responses cache `s-maxage=300`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | `{ ok: true }` |
| GET | `/menu` | Full aggregate (restaurant + categories + items) |
| GET | `/restaurant` | Restaurant record |
| GET | `/categories` | Categories without items |
| GET | `/menu-items` | Flat item list |
| GET | `/menu-items/:id` | One item |
| GET | `/settings` | `{ defaultLocale: "ar", currency: "AED" }` |

On database failure, `/menu` returns the bundled seed payload.

---

## 9. Frontend experience

### Hero

Full-viewport forest opening: extruded 3D petal mark, bilingual wordmarks, tagline, scroll cue. CSS 3D orbit of petals + glyph field. Idle tilt on phones (no gyro required); pointer/touch follows the guest.

### Category navigation (mobile-first)

Replaced the unusable bottom dock of 14 long labels with:

1. Sticky bar: logo · **current section button** · ع / EN
2. Horizontal **chips** that auto-center the active section
3. **Picker sheet** — 2-column grid of all sections with hero photos

Hash links (`#breakfast`, …) use `scroll-padding-top` so content is not hidden under the bar.

### Category sections

- Cream or forest surface from the seed
- English display name + Arabic name + category photo
- Item list; two columns from `lg` up
- Short landscape phones stay stacked (width + height breakpoints)

### Dish card and sheet

Card: Arabic/English name, price in درهم, optional portion note, tap scale, hover 3D tilt on mouse.  
Sheet: photo, names, note, price; drag-to-dismiss on coarse pointers; Escape + focus restore.

### Other surfaces

- Brand story from the brand book
- QR panel (forest/cream artwork) for table tents
- Footer
- Branded loading screen (skipped if the session already booted)
- Offline / cache banner
- Empty states for missing categories/items
- Skip link “انتقل إلى القائمة”

### i18n

- `document.documentElement.lang` and `dir` update with the route
- Copy in `src/data/copy.ts`
- Locale persisted in `localStorage`
- Language switch keeps `search` and `hash`

---

## 10. Motion and 3D (phone-first)

All GPU transforms. No Three.js.

| Piece | What it does |
| --- | --- |
| `PetalMark3D` | Extruded logo, slow rotate |
| `Scene3D` | Orbiting petals around the hero |
| `useSceneTilt` | Idle sine motion + pointer/touch + optional gyro |
| `GlyphField` | Floating «طبخة» marks on the hero |
| `Atmosphere` | Visible petals/glyphs + terracotta sheen on every menu section |
| Category photos | Scroll parallax (scale + translate) |
| Cards | In-view fade, tap scale, mouse tilt |
| `prefers-reduced-motion` | Cuts loops and long transitions |

---

## 11. Photography

There are **no per-dish photos** in the printed menu. Each section uses one 4:3 hero.

1. Original crops came from `scripts/extract_assets.py` (PDF page boxes).
2. Those crops were used as references to generate cleaner editorial heroes (no PDF type overlays).
3. `scripts/ingest_hero_photos.py` writes WebP at 480 / 900 / 1400 and `src/data/generated/images.json` (srcset + blur placeholder).

| Slug | File stem |
| --- | --- |
| breakfast | `breakfast-{w}.webp` |
| soups | `soups-{w}.webp` |
| salads-east | `salads-east-{w}.webp` |
| doughs | `doughs-{w}.webp` |
| cold-appetizers | `cold-appetizers-{w}.webp` |
| hot-appetizers | `hot-appetizers-{w}.webp` |
| hot-dishes-eastern | `hot-dishes-eastern-{w}.webp` |
| hot-dishes-western | `hot-dishes-western-{w}.webp` |
| pizza | `pizza-{w}.webp` |
| pasta | `pasta-{w}.webp` |
| sandwich-eastern | `sandwich-eastern-{w}.webp` |
| sandwich-western | `sandwich-western-{w}.webp` |
| grills | `grills-{w}.webp` |
| daily-dish | `daily-dish-{w}.webp` |

`src/lib/images.ts` serves `srcset` and a tiny WebP placeholder so cards never flash empty on slow mobile data.

---

## 12. Responsive behaviour

- Fluid type and padding: `clamp()` + `.screen-gutter` (safe-area insets)
- `viewport-fit=cover` for notched phones
- Mobile: stacked sections, chip nav + picker
- `min-width: 768px` **and** `min-height: 640px`: split title/photo + list (avoids treating phone landscape as a tablet)
- `lg+`: two-column dish lists
- `2xl`: wider max width (`110rem`)
- Landscape height ≤ 540px: compact hero row so wordmarks are not clipped
- `overflow-x: hidden` on `body`

---

## 13. Accessibility

- Semantic sections, headings, dialogs
- Focus-visible terracotta ring
- Skip to menu
- Touch targets ≥ ~44px on nav and close
- `aria-pressed` on language and picker
- Keyboard: Escape closes sheet/picker; focus returns to the opener
- Contrast: cream on forest, forest on cream, terracotta prices
- Reduced motion (see §10)

---

## 14. Performance

- QR-first: seed fallback, Query staleTime 5 min, gcTime 24 h
- Lazy `decoding="async"` images + srcset
- Self-hosted font subsets (200/300/500 Montserrat, 300/400/600 Cairo)
- GPU transforms only for motion
- API cache headers
- PWA manifest + favicons + Open Graph (`index.html`)

---

## 15. Environment and deploy

`.env` (never committed):

```
DATABASE_URL=          # Neon pooled string
VITE_PUBLIC_URL=       # public origin for QR artwork
```

See `.env.example`.

**Vercel:** root of the repo. `vercel.json` sends `/api/*` to the Hono function and everything else to the SPA.

**Neon:** project `tabkha-menu`, region Frankfurt.

**CI:** `.github/workflows/ci.yml` on push/PR to `main`.

Rollback: revert the Vercel deployment. Seed is idempotent upserts.

---

## 16. Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite at `:5173` (proxies `/api`) |
| `npm run api` | Hono at `:8787` |
| `npm run build` | Production frontend |
| `npm run typecheck` | `tsc` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (`menu.seed` + `format`) |
| `npm run db:migrate` | Apply `db/init.sql` |
| `npm run db:seed` | Upsert menu + write `menu.json` |
| `python scripts/extract_assets.py` | Rebuild brand SVGs / original PDF crops |
| `python scripts/ingest_hero_photos.py` | Convert generated heroes → WebP + manifest |

---

## 17. Content rules (do not violate)

- Arabic name + price from the printed menu are **authoritative**.
- Do not invent dishes, prices, or categories.
- Do not silently “correct” English that the PDF wrapped badly — update `CONTENT_REVIEW.md` and wait for kitchen sign-off.
- No per-item photos unless a new shoot exists.
- DIN Next is not licensed; keep Cairo until it is.

Flagged items (see `CONTENT_REVIEW.md`): missing English names, Butter Chicken vs kofta, hummus portion wording, Basmashkat spelling.

---

## 18. What was delivered against the original brief

| Brief item | Status |
| --- | --- |
| Brand-driven UI from PDFs | Done |
| Interactive digital menu, not a static page | Done |
| Hero + animated background + scroll language | Done |
| Category navigation | Done (picker + chips; old dock removed) |
| Food items + detail sheet | Done |
| QR-first mobile | Done |
| Arabic RTL + English LTR + persistence | Done |
| Responsive phone / tablet / desktop / landscape | Done |
| Graphic language from logo geometry | Done |
| Motion system + reduced motion | Done |
| React + TS + Vite + Tailwind + Motion | Done |
| Postgres schema ready for a future admin | Done — now includes a live CMS |
| REST API, cache, fallback, empty/error | Done |
| SEO / OG / favicon | Done |
| GitHub CI + Vercel-ready | Done |
| Env secrets not in git | Done |
| Accessibility | Done |
| ~130 items, 14 categories | Done |
| Professional category photos | Done (4:3 heroes) |
| Mobile-visible 3D / living section backgrounds | Done |
| Restaurant admin / CMS | Done (`/admin`) |
| Per-dish photos (optional) | Done |
| Draft / preview / publish | Done |
| Availability + reorder | Done |

---

## 20. Restaurant CMS (`/admin`)

The restaurant owns the live menu. Developers ship the platform; staff edit content.

### Two experiences

| Who | URL | Source of truth |
| --- | --- | --- |
| Guest (QR) | `/ar` or `/en` | Published + available rows in Postgres |
| Restaurant | `/admin` | Authenticated API; drafts included in preview |

The public QR never points at `/admin`. The existing QR panel still encodes `/{locale}`.

### Staff login

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (10+ characters) in `.env`.
2. Run `npm run db:migrate` then `npm run db:seed` once to create the owner user.
3. Open `/admin`, sign in, manage dishes.

Sessions are httpOnly cookies. The server hashes the session token (SHA-256) and verifies it on every mutation. Passwords use scrypt. Restaurant resources are scoped through `restaurant_users` — the client cannot pick another `restaurant_id`.

### What staff can do

- Dashboard counts (live, unavailable, missing English, missing photos)
- Category CRUD, drag-and-drop order, cream/forest surface, photos
- Dish CRUD, duplicate, availability toggle, featured, portion notes, dietary/allergen/spice fields
- Optional dish photos (cards stay typographic when empty)
- Bulk show / hide / move / delete (delete confirms)
- Save draft → preview (Arabic/English, mobile/desktop) → publish
- Restaurant settings (names, story, logo, QR URL, contact)
- Content flags: missing English, missing photo, needs review — no automatic translation

Deleting a category is blocked while dishes remain. Staff must reassign dishes first.

### Publishing

- Seeded print-menu rows start **published**
- New dishes/categories start as **drafts** until Publish
- Guests see `published && active && available`
- Unavailable dishes are hidden, not deleted
- `?preview=1` on `/ar` or `/en` (signed-in) shows drafts with a **DRAFT PREVIEW** banner

### Media

Binaries are not stored in Postgres. Metadata lives in `media`.

- Local: `uploads/` served at `GET /api/media/file/...`
- Production: Vercel Blob (`BLOB_READ_WRITE_TOKEN`)
- Uploads are sniffed, size-capped (6 MB), converted to WebP at 480 / 900 / 1400

### Cache

Public `GET /api/menu` uses a short CDN cache plus an ETag from `menu_revision`. Every admin mutation increments that revision so a new price is not stuck behind a long `s-maxage`.

### Admin bundle

`/admin` is lazy-loaded. The guest QR bundle does not include the CMS.

---

## 21. Authenticated API

Public GETs are unchanged (now filtered to published + available). Mutations require a session cookie.

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/auth/login` | no |
| POST | `/api/auth/logout` | cookie |
| GET | `/api/auth/me` | cookie |
| GET | `/api/admin/overview` | yes |
| GET | `/api/admin/categories` | yes |
| POST | `/api/categories` | yes |
| PUT | `/api/categories/:id` | yes |
| DELETE | `/api/categories/:id` | yes |
| PATCH | `/api/categories/reorder` | yes |
| GET | `/api/admin/menu-items` | yes |
| POST | `/api/menu-items` | yes |
| PUT | `/api/menu-items/:id` | yes |
| DELETE | `/api/menu-items/:id` | yes |
| PATCH | `/api/menu-items/reorder` | yes |
| PATCH | `/api/menu-items/:id/availability` | yes |
| POST | `/api/menu-items/:id/duplicate` | yes |
| POST | `/api/menu-items/bulk` | yes |
| POST | `/api/media` | yes |
| GET | `/api/preview/menu` | yes |
| GET/PUT | `/api/admin/settings` | yes |

---

## 22. How to run

```bash
npm install
cp .env.example .env    # DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:migrate
npm run db:seed
```

Terminal A: `npm run api`  
Terminal B: `npm run dev`

- Guests: `http://localhost:5173/ar`
- Staff: `http://localhost:5173/admin`
