# Volta Electronics — architecture map

This document is the “start here” guide for coding and code review. File paths are relative to `ecommerce-nextjs-main/`.

## Runtime services

| Service | Port | Responsibility |
|--------|------|----------------|
| **Next.js** (`npm run dev`) | 3000 | UI (App Router + legacy `pages/`), REST APIs under `src/app/api/*`, Mongoose models. |
| **MongoDB** | 27017 | Source of truth for **products** and **purchase signals**. |
| **Flask** (`python app.py`) | 5000 | Matrix factorization recommender; reads the same `purchases` collection as Next. |

Environment variables live in `.env.local` (see `.env.example`). **Critical:** `MONGO_URI` must point at one database name; both Mongoose and PyMongo parse that name so collections align (`products`, `purchases`).

## Data model (MongoDB)

- **`Product`** (`src/libs/models/Product.ts`) — catalog fields including stable `prodId` (used everywhere: cart, purchases, recommender columns) and `slug` for pretty URLs.
- **`Purchase`** (`src/libs/models/Purchase.ts`) — one document ≈ one rating event (checkout expands quantity). Drives trending aggregates and the Flask ratings matrix.

## Request flows

### Browse & buy

1. **Shop listing** — `src/app/shop/page.tsx` (server) queries `Product` (Electronics only; optional `?subcategory=`).
2. **Product detail** — `src/app/shop/[slug]/page.tsx` loads one product by `slug`.
3. **Cart** — Redux `cartSlice`; line item `id` is **`prodId`** (not Mongo `_id`) so checkout lines match recommender ids.
4. **Checkout** — `pages/checkout.js` POSTs to `POST /api/purchases`, which inserts `Purchase` rows, then clears the cart.

### Recommendations

1. **Cold start** — In `app.py`, function `recommend_items` is unchanged: unknown users fall through to **global popularity** (mean rating by `prod_id`). That is the assigned cold-start behavior.
2. **Warm users** — Same function returns top-N from the SVD-scored vector (existing pipeline).
3. **Hydration for UI** — After `recommend_items` returns id lists, Flask merges **display** fields from Mongo `products` (name, price, img, slug). This does not change ranking logic.
4. **Browser → Flask** — Prefer `GET /api/recommendations?user_id=` (Next proxy) so the client is not hard-coded to port 5000.

### Trending (home page)

`GET /api/trending` aggregates `Purchase` counts (last 12 months) and joins `Product` for thumbnails. This explains “what shoppers bought lately” and overlaps conceptually with the popularity pool used in cold start.

## Important folders

```
src/app/api/          # Next REST: products, purchases, trending, recommendations proxy
src/app/shop/         # Storefront (App Router) + `layout.tsx` chrome (nav/cart)
src/components/catalog/   # Reusable product tile + add-to-cart
src/libs/models/      # Mongoose schemas
scripts/seed_database.py # Demo catalog + synthetic purchases (+ image download)
app.py                # Flask recommender (loads interactions from Mongo or CSV fallback)
```

## Windows + Next.js typegen note

If `next build` fails on generated `validator.ts` paths, a junction `app` → `src/app` may exist from an earlier fix; ESLint ignores `app/**` in `.eslintrc.json` to avoid duplicate lint. On a fresh clone without the junction, follow the comment in `next.config.mjs` or recreate the junction as documented in prior project notes.

## Seeding

```bash
pip install -r requirements.txt
npm run db:seed
```

Requires `MONGO_URI` in `.env.local`. Images are written to `public/catalog/`.
