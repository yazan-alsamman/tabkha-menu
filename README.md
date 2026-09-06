# طبخة آند مور — Tabkha and More

Premium interactive digital menu for **طبخة آند مور**. Brand colours, wordmarks and dish names come from the files in `referenses/`, not from a generic restaurant template.

Full build record: [DOCUMENTATION.md](DOCUMENTATION.md). Content flags: [CONTENT_REVIEW.md](CONTENT_REVIEW.md).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + Motion
- Hono API on Vercel
- Neon Postgres (Frankfurt) via Drizzle ORM
- Restaurant CMS at `/admin` (session auth + media uploads)
- Arabic RTL and English LTR, default Arabic

## Local development

```bash
npm install
cp .env.example .env   # then paste DATABASE_URL from Neon
npm run db:migrate
npm run db:seed
```

In two terminals:

```bash
npm run api    # http://127.0.0.1:8787
npm run dev    # http://127.0.0.1:5173  (proxies /api)
```

The public menu still renders if the API is down: it falls back to the bundled seed snapshot so a QR scan is never a blank screen.

Restaurant staff: open `http://localhost:5173/admin` after setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` and re-running `npm run db:seed` once.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite frontend |
| `npm run api` | Local Hono server |
| `npm run build` | Production frontend build |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run db:migrate` | Apply `db/init.sql` |
| `npm run db:seed` | Insert missing print-menu rows (does not overwrite restaurant edits) + write `src/data/generated/menu.json`. Creates the admin user when `ADMIN_EMAIL` / `ADMIN_PASSWORD` are set. |

Regenerate brand crops from the source PDFs:

```bash
python scripts/extract_assets.py
```

## Environment

| Variable | Where | Notes |
| --- | --- | --- |
| `DATABASE_URL` | API / seed (server only) | Neon pooled connection string |
| `VITE_PUBLIC_URL` | Frontend | Public origin used when drawing the menu QR (must be `/ar`, never `/admin`) |
| `ADMIN_EMAIL` | Seed / login | First restaurant owner. Required to create the CMS user. |
| `ADMIN_PASSWORD` | Seed | At least 10 characters. Never commit. |
| `ADMIN_NAME` | Seed | Optional display name |
| `BLOB_READ_WRITE_TOKEN` | API (production) | Vercel Blob for dish/category photos. Locally, files are stored under `uploads/` |

Never commit `.env`. Never expose `DATABASE_URL` to the browser.

## Deploy

**Frontend + API:** Vercel, root of this repo.

**Database:** Neon project `tabkha-menu` (`aws-eu-central-1`).

On Vercel set `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (for the first seed), `VITE_PUBLIC_URL`, and `BLOB_READ_WRITE_TOKEN` for persistent photo uploads. GitHub Actions runs install → typecheck → lint → test → build on every push to `main`.

## Content accuracy

Arabic names and prices were read from the printed menu. Layout bugs in the PDF (wrapping English names) are documented in [CONTENT_REVIEW.md](CONTENT_REVIEW.md). Do not “fix” those in the UI until the restaurant signs off.

## Branching and commits

- `main` is production
- Feature branches, conventional commits (`feat:`, `fix:`, `chore:`)
- Rollback: revert the Vercel deployment; database seed inserts missing print-menu rows only and will not overwrite restaurant CMS edits
