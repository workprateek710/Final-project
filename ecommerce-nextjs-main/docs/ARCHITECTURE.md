# Volta Electronics — architecture map

This document is the “start here” guide for coding and code review. File paths are relative to `ecommerce-nextjs-main/`.

## Runtime services

| Service | Port | Responsibility |
|--------|------|----------------|
| **Next.js** (`npm run dev`) | 3000 | UI (App Router + legacy `pages/`), REST APIs under `src/app/api/*`, Mongoose models. |
| **MongoDB** | 27017 | Source of truth for **products** and **purchase signals**. |

Environment variables live in `.env.local` (see `.env.example`). **Critical:** `MONGO_URI` must point at one database name; both Mongoose and PyMongo parse that name so collections align (`products`, `purchases`).

## Data model (MongoDB)

- **`Product`** (`src/libs/models/Product.ts`) — catalog fields including stable `prodId` (used everywhere: cart, purchases, recommender columns) and `slug` for pretty URLs.
- **`Purchase`** (`src/libs/models/Purchase.ts`) — one document ≈ one rating event (checkout expands quantity). Drives trending aggregates and personalized recommendations.

## Request flows

### Browse & buy

1. **Shop listing** — `src/app/shop/page.tsx` (server) queries `Product` (Electronics only; optional `?subcategory=`).
2. **Product detail** — `src/app/shop/[slug]/page.tsx` loads one product by `slug`.
3. **Cart** — Redux `cartSlice`; line item `id` is **`prodId`** (not Mongo `_id`) so checkout lines match recommender ids.
4. **Checkout** — `pages/checkout.js` POSTs to `POST /api/purchases`, which inserts `Purchase` rows, then clears the cart.

### Recommendations

1. **Request** — Browser components call `GET /api/recommendations?user_id=` inside the Next.js app.
2. **Scoring** — `src/app/api/recommendations/route.ts` builds TF-IDF vectors from product metadata and scores candidates against the user's recent purchases.
3. **Response** — The route returns display-ready product fields from Mongo (`name`, `price`, `imgSrc`, `slug`, rating metrics) without calling an external recommender service.

### Trending (home page)

`GET /api/trending` aggregates `Purchase` counts (last 12 months) and joins `Product` for thumbnails. This explains “what shoppers bought lately” and overlaps conceptually with the popularity pool used in cold start.

## Important folders

```
src/app/api/          # Next REST: products, purchases, trending, recommendations proxy
src/app/shop/         # Storefront (App Router) + `layout.tsx` chrome (nav/cart)
src/components/catalog/   # Reusable product tile + add-to-cart
src/libs/models/      # Mongoose schemas
scripts/seed_database.py # Demo catalog + synthetic purchases (+ image download)
```

## Windows + Next.js typegen note

If `next build` fails on generated `validator.ts` paths, a junction `app` → `src/app` may exist from an earlier fix; ESLint ignores `app/**` in `.eslintrc.json` to avoid duplicate lint. On a fresh clone without the junction, follow the comment in `next.config.mjs` or recreate the junction as documented in prior project notes.

## Seeding

```bash
pip install -r requirements.txt
npm run db:seed
```

Requires `MONGO_URI` in `.env.local`. Images are written to `public/catalog/`.
