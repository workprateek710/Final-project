# Full-Stack E-Commerce Platform with Content-Based Recommendations

**By** [Your Name]

**A PROJECT REPORT SUBMITTED IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE COURSE**

**CPSC-597: Project (Seminar)**

**Master of Science in Computer Science**

**CALIFORNIA STATE UNIVERSITY, FULLERTON**

**Spring 2026**

**SUPERVISOR**

Dr. [Supervisor Name]

---

## Abstract

Volta is a full-stack **e-commerce web application** with an embedded **content-based recommendation** subsystem suitable for coursework demonstration and deployment on **Vercel** with **MongoDB Atlas**. The storefront is implemented with **Next.js 15**, **React 18**, and **TypeScript** using the **App Router** for pages and **Route Handlers** (`src/app/api/**`) for JSON APIs. Persistent state uses **MongoDB** via **Mongoose**.

Recommendations rank candidate electronics SKUs using **TF–IDF** sparse vectors built from product text (name, category, subcategory, brand, description) and **cosine similarity**, personalized by each user’s **`Purchase`** history with **recency weights** and optional **`ProductRating`** boosts. Candidates exclude prior purchases; ties break on popularity and review counts. **Cold-start** users rely on a **trending** strip driven by **`GET /api/trending`** (purchase counts over the last **365 days**, top **8** items). Offline tooling includes **Python** seed scripts (`scripts/seed_database.py`) and **Node** demo utilities; **online scoring runs in TypeScript** (`src/app/api/recommendations/route.ts`, `src/utils/recommendationScoring.ts`), not in a separate Python inference service.

---

## 1. Introduction

Electronic commerce exposes shoppers to large catalogs. Without guidance, users face **choice overload** and weak discovery. **Recommender systems** compress the catalog into a short ranked list conditioned on behavior (purchases, ratings) and item text. Educational projects must also satisfy **deployability**: recommendation logic should run in the same serverless-friendly stack as the storefront.

This report presents **Volta Electronics**, a MongoDB-backed storefront with **NextAuth.js** authentication, **Redux Toolkit** cart state, **UploadThing** for admin imagery, and an admin console gated by **`NEXT_PUBLIC_ADMIN_EMAILS`**. The primary technical contribution is a **transparent TF–IDF + cosine similarity** pipeline integrated directly into Next.js API routes, complemented by **popularity-based trending** for guests and thin histories.

The primary contributions of this project include:

- **Development of a full-stack Next.js + MongoDB commerce platform** with customer storefront, checkout recording, profile APIs, and admin dashboards.  
- **Implementation of a history-aware content-based recommender** (TF–IDF, cosine similarity, recency and rating weighting) in **TypeScript** route handlers.  
- **Integration of discovery UX**: trending aggregation, search suggestions, category/sort navigation, and insufficient-history messaging.  
- **Demonstration data pipeline** via Python seeding and optional synthetic purchases for analytics-style demos.

The remainder of this report follows **motivation and problem framing**, **related work**, **architecture and methodology**, **implementation with screenshots**, **testing and evaluation**, **discussion**, and **conclusion / future work**.

---

## 2. Motivation and Problem Statement

### 2.1 Motivation

Modern shoppers expect **personalized discovery** comparable to large retailers, but course-scale projects rarely have dense collaborative matrices (many users × many items). **Content-based filtering** remains attractive because it can rank items using **catalog text** and a **small behavioral footprint** derived from **checkout history**: completing **`/checkout`** sends cart lines to **`POST /api/purchases`**, which expands quantities into individual **`Purchase`** documents in MongoDB (each row is **`userId`** + **`prodId`** + timestamps)—those rows feed both **trending** and the **recommender**.

**Listing 2.1** — Server-side expansion of checkout lines into **`Purchase`** rows (`src/app/api/purchases/route.ts`):

```typescript
const docs: { userId: string; prodId: string }[] = [];
for (const line of items) {
  if (!line?.prodId) continue;
  const qty = Math.min(20, Math.max(1, Number(line.quantity) || 1));
  for (let i = 0; i < qty; i++) {
    docs.push({ userId, prodId: line.prodId });
  }
}
await Purchase.insertMany(docs);
```

**Listing 2.2** — Checkout completion posts Redux cart lines with the same **`userId`** string used elsewhere on the storefront (`pages/checkout.js`):

```javascript
await axios.post("/api/purchases", {
  userId,
  items: products.map((p) => ({ prodId: p.id, quantity: p.quantity })),
});
```

Instructors and reviewers also expect a **credible web UX**: registration/login (`/signup`, `/login`), **Mongo-backed** catalog browsing (`/shop`, `/shop/[slug]`), persisted cart (**Redux + redux-persist**, cart slice only), **multi-step checkout** that writes purchases to the database, optional **profile** data (`/profile`, profile APIs), **explicit star ratings** (`ProductRating` + `/api/ratings`), and an **admin** console (`/admin/**`) for catalog oversight.

**Listing 2.3** — Cart persistence configuration (only **`cartReducer`** is rehydrated from **`localStorage`**; `src/redux/store.ts`):

```typescript
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cartReducer"],
};
```

Deploying on **Vercel** favors **stateless HTTP handlers** with predictable latency. That motivates keeping recommendation scoring **inside** Next.js **route handlers** (`src/app/api/recommendations/route.ts`) instead of a separate training or inference service.

### 2.2 Problem Statement

The problems addressed by this project include:

- **Cold start / thin history:** The personalized **`RecommendationsPanel`** on **`/`** only mounts when **`localStorage`** contains **`user`** after storefront login; guests see a **sign-in call-to-action** instead of personalized rows. Signed-in users with fewer purchases than **`MIN_PURCHASES_FOR_RECS`** receive JSON **`reason: "insufficient_history"`** and copy explaining that recommendations unlock after purchase activity. **Discovery without dense history** still relies on **category/sort navigation**, **navbar search**, and—when the database has purchase rows—**`/api/trending`** for the **Trending electronics** strip (the strip is omitted if trending returns no rows).  
- **Thin behavioral signals:** Purchases are implicit positives; explicit ratings may be sparse—the implementation still reads **`ProductRating`** when present and uses it to **up-weight** similarity contributions from rated prototype purchases in **`GET /api/recommendations`**.  
- **Operational integration:** Recommendation scoring reads the same MongoDB collections as the storefront (**products**, **purchases**, **productratings**; plus **users** for accounts/auth)—implemented with **Mongoose** models under **`src/libs/models/`**.  
- **Explainability vs complexity:** TF–IDF + cosine similarity are easier to trace than latent-factor models at this scale; the API returns **`recommendationBasis`** metadata for transparency.  
- **Identity bridging (implemented pattern):** After **`/login`**, the client sets **`localStorage.setItem("user", uid)`** where **`uid`** is **`session?.user?.email ?? normalizedEmail`** (typically the user’s **email string**). **`/checkout`** reads that same value and posts it as **`userId`** in **`POST /api/purchases`**, so **`Purchase.userId`** matches what **`RecommendationsPanel`** and **`/recommendations`** send as **`user_id`**. A production hardening pass would replace this with a single canonical user key everywhere (e.g., stable Mongo **`User`** id in **`localStorage`** after signup/login).

**Listing 2.4** — Storefront login persists the identifier used by checkout and recommendation APIs (`src/app/login/page.tsx`):

```typescript
const session = await getSession().catch(() => null);
const uid = session?.user?.email ?? normalizedEmail;
if (typeof window !== "undefined") {
  localStorage.setItem("user", uid);
}
```

**Listing 2.5** — UI reaction to **`insufficient_history`** from **`GET /api/recommendations`** (`src/components/front-end/RecommendationsPanel.tsx`):

```typescript
const res = await fetch(`/api/recommendations?user_id=${encodeURIComponent(userId)}`, {
  cache: "no-store",
});
const data = await res.json();
setRows(data?.recommendations ?? []);
setShowEmptyHint(data?.reason === "insufficient_history");
```

### 2.3 Proposed Solution

The proposed solution is **Volta**, implemented under **`ecommerce-nextjs-main/`**:

- **Frontend (hybrid routing):** Most storefront and admin UI uses the **App Router** (`src/app/**`): **`/`**, **`/shop`**, **`/shop/[slug]`**, **`/login`**, **`/signup`**, **`/profile`**, **`/recommendations`**, **`/admin/**`**. **Cart** and **checkout** use the **Pages Router** (`pages/cart.js`, **`pages/checkout.js`**) with the same Redux store and shared **`Navbar`**. Styling is **Tailwind**; cart state uses **Redux Toolkit** with **redux-persist** (whitelist **`cartReducer`** only).  
- **Backend:** JSON APIs live under **`src/app/api/**`** (catalog, purchases, ratings, recommendations, trending, profile CRUD, auth helpers, UploadThing). **NextAuth** session routes live at **`/api/auth/[...nextauth]`** (`src/libs/authOptions.ts`)—**JWT** sessions, **Credentials** provider plus optional **Google** when env vars are set; demo **`admin@volta.test`** path documented for admin login.  
- **Database:** Mongoose schemas **`Product`**, **`Purchase`**, **`User`**, **`ProductRating`** (`src/libs/models/`).  
- **Recommendations:** **`GET /api/recommendations`** loads **`Purchase`** history for the supplied **`user_id`**, builds TF–IDF vectors for products with **`category: "Electronics"`**, scores unseen SKUs with cosine similarity weighted by **recency** and optional **`ProductRating`** entries, and returns JSON consumed by **`RecommendationsPanel`** (`src/app/page.tsx`) and **`/recommendations`** (`src/app/recommendations/page.tsx`).  
- **Trending:** **`GET /api/trending`** aggregates **`Purchase`** counts over the **last 365 days**, keeps top **8**, joins **`Product`** rows—powering **`TrendingStrip`** on the home page.  
- **Tooling:** **`scripts/seed_database.py`** loads on the order of **~100** electronics SKUs (exact count follows script lists) and optional **`--demo-purchases`**; assorted **`scripts/*.cjs`** utilities support demos and reporting.

---

## 3. Related Work and Literature Review

### 3.1 Introduction

Recommender systems research spans **content-based**, **collaborative**, and **hybrid** approaches. Information-retrieval weighting—notably **TF–IDF**—produces interpretable vectors from short product text, which matches how **Volta** builds item representations **at request time** in application code (rather than via an offline training-only pipeline).

### 3.2 Content-Based Filtering

Content-based systems score candidates using **item features**—here, tokenized text assembled from **`name`**, **`category`**, **`subcategory`**, **`brand`**, and **`description`** (`src/utils/recommendationScoring.ts`). **Bag-of-words** TF–IDF weighting is a classical baseline (**Salton & Buckley**): transparent and usable without dense neighbor-user overlap. Weaknesses include **limited semantic depth** (synonyms, typos) and **homogeneous copy** across SKUs.

**Listing 3.1** — Concatenating catalog fields, tokenizing, and constructing per-product TF–IDF maps (`src/utils/recommendationScoring.ts`):

```typescript
function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function productText(product: RecommendationProductSource) {
  return [
    product.name,
    product.category,
    product.subcategory,
    product.brand,
    product.description,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildTfIdfVectors(products: RecommendationProductSource[]) {
  const documents = products.map((product) => tokenize(productText(product)));
  const docFreq = new Map<string, number>();
  for (const tokens of documents) {
    for (const token of new Set(tokens)) {
      docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
    }
  }
  const totalDocs = Math.max(1, documents.length);
  return documents.map((tokens) => {
    const counts = new Map<string, number>();
    for (const token of tokens) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
    const vector = new Map<string, number>();
    for (const [token, count] of counts) {
      const tf = count / Math.max(1, tokens.length);
      const idf = Math.log((1 + totalDocs) / (1 + (docFreq.get(token) ?? 0))) + 1;
      vector.set(token, tf * idf);
    }
    return vector;
  });
}
```

**Listing 3.2** — Cosine similarity over sparse token maps (shared numerator only on overlapping keys):

```typescript
export function cosineSimilarity(a: Map<string, number>, b: Map<string, number>) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const value of a.values()) normA += value * value;
  for (const value of b.values()) normB += value * value;
  for (const [token, value] of a) {
    dot += value * (b.get(token) ?? 0);
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

**What Volta actually implements:** For each request, the API builds TF–IDF **sparse maps** per **Electronics** product (`Product.find({ category: "Electronics" })` in **`src/app/api/recommendations/route.ts`**), then sums **cosine similarity** contributions from the signed-in user’s **recent `Purchase` rows** (prototypes), with **recency decay** and optional **`ProductRating`** multipliers—no separate collaborative latent-factor model.

**Listing 3.3** — Parallel data load, **Electronics** catalog filter, and **`insufficient_history`** gate (`src/app/api/recommendations/route.ts`):

```typescript
const [userPurchases, products, activityRows] = await Promise.all([
  Purchase.find({ userId }).sort({ createdAt: -1 }).lean<PurchaseDoc[]>(),
  Product.find({ category: "Electronics" })
    .select(
      "prodId slug name imgSrc category subcategory brand description price ratingAvg reviews"
    )
    .lean<ProductDoc[]>(),
  Purchase.aggregate<ActivityRow>([
    { $group: { _id: "$prodId", purchases: { $sum: 1 } } },
  ]),
]);

if (userPurchases.length < MIN_PURCHASES_FOR_RECS) {
  return NextResponse.json({
    recommendations: [],
    reason: "insufficient_history",
    purchaseCount: userPurchases.length,
  });
}
```

**Listing 3.4** — Recency/rating weighting on prototypes and **global popularity / reviews** tie-break after cosine accumulation (`src/app/api/recommendations/route.ts`):

```typescript
const recencyWeight = 1 / (1 + purchaseIndex * 0.15);
const ratingWeight = explicitRating ? Math.max(1, explicitRating) / 5 : 1;
const weightedScore = similarity * recencyWeight * ratingWeight;
// ...
.sort((a, b) => {
  if (b.score !== a.score) return b.score - a.score;
  if (b.purchases !== a.purchases) return b.purchases - a.purchases;
  return b.reviews - a.reviews;
});
```

### 3.3 Collaborative Filtering and Aggregate Behavior

Classical **collaborative filtering** (e.g., matrix factorization over user–item ratings) exploits **cross-user** structure (**Ricci et al., Recommender Systems Handbook**). Volta **does not** ship matrix factorization or item–item CF in TypeScript.

However, the live system **does** use **aggregate purchase counts across all users** in two places: (1) **`GET /api/trending`** ranks SKUs by total purchases in a trailing window—pure **popularity**; (2) **`GET /api/recommendations`** breaks ties on **global purchase totals** and **`reviews`** after content scores. Those signals are **not** personalized latent factors; they are **lightweight behavioral aggregates**, orthogonal to the **per-user** TF–IDF scoring core.

**Listing 3.5** — Trending uses a **365-day** window, groups **`Purchase`** rows by **`prodId`**, sorts by count, and limits **8** (`src/app/api/trending/route.ts`):

```typescript
const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
const agg = await Purchase.aggregate([
  { $match: { createdAt: { $gte: since } } },
  { $group: { _id: "$prodId", purchases: { $sum: 1 } } },
  { $sort: { purchases: -1 } },
  { $limit: 8 },
]);
```

### 3.4 Hybrid Approaches and Retrieval Foundations

Hybrid recommenders blend content and collaborative signals for robustness. Separately, **vector-space** cosine similarity normalizes for vector length—helpful when SKU titles and descriptions differ in length (**Manning, Raghavan, Schütze**, *Introduction to Information Retrieval*).

**Volta:** The personalized ranker is **hybrid only in a narrow sense**: **content similarity** drives the main score; **popularity/review tie-breaks** and the **trending** strip add **non-personalized** behavioral emphasis. That matches the course scope (interpretable pipeline + deployable handler) rather than a trained hybrid ranker.

### 3.5 Summary

Related work distinguishes **content-based** methods (item features, interpretable similarity), **collaborative** methods (latent structure across many users), and **hybrids** that blend both. Volta sits primarily in the **content-based** camp: product text is tokenized and weighted with **TF–IDF**, candidates are ranked by **cosine similarity** to vectors derived from the signed-in user’s recent **purchases**, with **recency** and optional **explicit ratings** adjusting contribution weights. That design favors **transparency** (each score traces to overlapping tokens and known prototypes) and fits **sparse** purchase histories typical of a course-scale deployment.

Volta does **not** implement classical collaborative filtering (e.g., matrix factorization or neighborhood models over a dense user–item matrix). Cross-user signal appears only as **aggregates**: **trending** ranks SKUs by purchase volume in a fixed time window, and the personalized ranker uses **global purchase counts** and **review counts** chiefly as **tie-breakers** after content similarity—not as learned per-user latent factors.

Within that framing, Volta is best described as a **content-based recommender with lightweight behavioral augmentation**, not a full hybrid CF system. This chapter’s claims are scoped to **architecture and implementation** as reflected in the codebase; the repository does **not** ship large-scale offline evaluation (e.g., precision@K or A/B harnesses), so comparative quantitative claims against industrial baselines are intentionally avoided.

---

## 4. System Architecture and Design

### 4.1 Introduction

Volta follows a **three-tier** structure:

1. **Presentation:** React client components (navbar, cart drawer, shop grids, admin layouts).  
2. **Application:** Next.js **Route Handlers** implementing REST-style JSON endpoints.  
3. **Data:** MongoDB accessed through **Mongoose** (`connectMongoDB` reads **`MONGO_URI`** or **`MONGODB_URI`**).

### 4.2 Overall System Architecture

Customers and admins use the **Next.js client**. The browser calls route handlers for catalog reads, checkout recording (`POST /api/purchases`), ratings (`/api/ratings`), recommendations (`/api/recommendations`), trending (`/api/trending`), and authentication (NextAuth). The server connects to MongoDB for authoritative records; optional integrations include **UploadThing** for hosted file uploads and **Google OAuth** when configured.

### 4.3 Architecture Layers

| Layer | Purpose |
|-------|---------|
| **Presentation Layer** | Next.js/React UI: storefront, cart, recommendations panels, admin chrome (`Sidebar`, dashboards). |
| **Application Layer** | Route handlers: CRUD/query products, purchases, ratings, recommendations, trending, profile, auth bridges. |
| **Data Layer** | MongoDB collections via Mongoose schemas (`Product`, `Purchase`, `User`, `ProductRating`). |
| **Integration Layer** | NextAuth providers; UploadThing routes; optional external OAuth. |

### 4.4 Frontend Design

Key surfaces:

- **Landing (`/`):** hero, **TrendingStrip**, conditional **RecommendationsPanel** (requires storefront `localStorage.user`), marketing sections.  
- **Shop (`/shop`):** category chips (distinct subcategories), sort pills (`popular`, `price-low`, etc.), **ProductTile** grid.  
- **Product detail (`/shop/[slug]`):** SKU detail pages server-rendered from MongoDB.  
- **Checkout (`pages/checkout.js`):** multi-step Volta checkout demo (cart → shipping → payment → review).  
- **Admin (`/admin/**`):** gated by NextAuth session **and** email allowlist **`NEXT_PUBLIC_ADMIN_EMAILS`**.

**State:** Redux Toolkit store with **redux-persist** on the cart slice (`PersistGate` in `App.tsx`).

### 4.5 Backend and API Design

Handlers validate inputs, reuse mongoose connections when warm, and return JSON. Representative groups:

- **Catalog:** `GET /api/get_products` (filters: category, subcategory, featured), slug helpers.  
- **Merchandising:** `add_product`, `edit_product/[id]`, `delete_product/[id]` for admin workflows.  
- **Commerce:** `POST /api/purchases`, `GET /api/purchases/mine`.  
- **Feedback:** `GET/POST /api/ratings` with uniqueness on `(prodId, userId)` and aggregate updates to **`Product.ratingAvg` / `reviews`**.  
- **Personalization:** `GET /api/recommendations`, `GET /api/trending`.  

**Caching:** `get_products` sets **`Cache-Control: no-store`** for demo freshness.

### 4.6 Database Design

| Entity | Purpose |
|--------|---------|
| **Product** | `prodId`, `slug`, merchandising fields (`name`, `price`, `category`, `subcategory`, `brand`, `description`, imagery, `featured`, `stock`, aggregates). |
| **Purchase** | One row per unit purchased (`userId`, `prodId`, timestamps; optional mirrored rating field). |
| **User** | Credential storage (`passwordHash`), profile, nested saved addresses/payments (demo-oriented payment fields). |
| **ProductRating** | Explicit per-user star ratings (`prodId`, `userId`, `rating`). |

### 4.7 Security and Access Control

- **NextAuth** JWT sessions (**30-day** `maxAge`) with **CredentialsProvider** (bcrypt verification against Mongo users + documented demo admin path) and optional **GoogleProvider** when env keys exist.  
- **Admin layout** denies non-allowlisted emails after session hydration; production systems should mirror checks on mutating APIs.  
- Demo shortcuts (predictable credentials, verbose API errors) should be rotated before any public deployment.

### 4.8 Recommendation Methodology (Design)

#### 4.8.1 Data Sources and Seeding

Python **`seed_database.py`** merges list constants (**`CATALOG`**, extensions) into ~**100** electronics SKUs, downloads imagery into **`public/catalog/`**, and optionally inserts synthetic **`Purchase`** rows (`--demo-purchases`) to animate trending/recommendations.

#### 4.8.2 Purchases and Ratings

Checkout expands quantities into discrete **`Purchase`** documents (per-line quantity capped server-side). **`POST /api/ratings`** upserts **`ProductRating`**, updates **`Product`** aggregates, and propagates ratings onto matching **`Purchase`** rows via **`updateMany`**.

#### 4.8.3 Text Preprocessing

Tokenizer lowercases text, replaces non-alphanumeric runs with spaces, splits tokens, and drops tokens with length ≤ **2**. Concatenate **name, category, subcategory, brand, description**.

#### 4.8.4 TF–IDF and Cosine Similarity

For token multiset *T_d* in document *d* with length *n_d*, term frequency is tf(*t*,*d*) = *f_{t,d}* / max(1,*n_d*). With corpus size *N* and document frequency df(*t*), idf(*t*) = ln((1+*N*)/(1+df(*t*))) + 1. TF–IDF weight is tf × idf stored in sparse maps. Cosine similarity computes normalized dot product over token overlap; implementation returns **0** if either norm is zero.

#### 4.8.5 Ranking and Trending

Prototype purchases (recent window up to **`RECENT_PURCHASE_CONTEXT` = 20**) contribute cosine scores weighted by **recency** *w_recency(i)* = 1 / (1 + 0.15 × *i*) and optional **rating weight** max(1,*r*)/5 for *r* ∈ [1,5]. Final sort: score, then global purchase counts, then **`reviews`**. Trending uses a **365-day** purchase window, aggregates counts per **`prodId`**, sorts descending, limits **8**, hydrates product rows—orthogonal to textual similarity.

#### 4.8.6 Parameters

| Name | Role |
|------|------|
| **`MIN_PURCHASES_FOR_RECS`** | Minimum purchases before personalized recommendations (JSON `insufficient_history` otherwise). |
| **`limit`** query param | Clamped server-side (max **60**). |

#### 4.8.7 Division of Labor

**Python:** bulk seeding, taxonomy helpers. **TypeScript:** online scoring path co-located with Mongoose queries for deployment simplicity.

### 4.9 Design Summary

Volta separates UI, JSON APIs, Mongo models, and optional integrations. Recommendation scoring is **embedded** in Next.js (interpretable, debugger-friendly) while trending addresses **cold-start discovery**. The design trades modeling sophistication for reproducibility and instructor-grade transparency.

---

## 5. Implementation Details with Screenshots

### 5.1 Introduction

This section summarizes **how** major features were implemented—authentication, catalog navigation, checkout persistence, ratings, trending/recommendations, admin tooling—and includes **screenshots** taken from the running application. Images live in **`docs/report-screenshots/`**. Server runs should load **`.env.local`** into the process environment on Windows when using `next start` so SSR routes such as **`/shop`** resolve **`MONGO_URI`**.

### 5.2 Implemented Modules

| Module | Implementation purpose |
|--------|-------------------------|
| **Authentication** | NextAuth credentials (+ optional Google); storefront login stores `localStorage.user` for UX continuity with purchase APIs. |
| **Catalog / Shop** | Server-rendered grids with category chips and sort pills; dynamic **[slug]** PDPs. |
| **Cart / Checkout** | Redux cart; `/checkout` posts purchases to MongoDB. |
| **Ratings** | `ProductRating` upserts + aggregate updates on **`Product`**. |
| **Trending** | `TrendingStrip` calls `/api/trending`. |
| **Recommendations** | `RecommendationsPanel` calls `/api/recommendations`. |
| **Admin** | Dashboard/products/analytics routes behind session + email allowlist. |
| **Uploads** | UploadThing handlers for admin media workflows. |
| **Tooling** | Python seed + Node scripts for demo datasets. |

### 5.3 Frontend Implementation Highlights

**Navbar** provides electronics search (desktop + mobile widths), category and filter dropdowns routing to **`/shop?...`**, cart affordances, and links to checkout/profile/admin. Search suggestions blend **`/api/trending`** and **`/api/recommendations`** when the query is empty.

### 5.4 Backend Implementation Highlights

Route handlers orchestrate Mongo queries and JSON responses. **`GET /api/recommendations`** batches purchases, catalog projections, activity aggregates, and optional rating rows, then executes TF–IDF scoring in-process.

### 5.5 Figures (Screenshots)

**Figure 5.1:** Customer login page (`/login`) for the Volta storefront.

![Figure 5.1 — Customer login](docs/report-screenshots/01-customer-login.png)

**Figure 5.2:** Sign-up page (`/signup`) for account registration.

![Figure 5.2 — Sign-up](docs/report-screenshots/02-sign-up.png)

**Figure 5.3:** Admin console login (`/admin/dashboard` before authentication).

![Figure 5.3 — Admin login](docs/report-screenshots/03-admin-login.png)

**Figure 5.4:** Admin dashboard after credentials sign-in—catalog table/search (**`NEXT_PUBLIC_ADMIN_EMAILS`** gates access).

![Figure 5.4 — Admin dashboard](docs/report-screenshots/04-admin-dashboard-full.png)

**Figure 5.5:** Home page showing landing layout and navigation chrome.

![Figure 5.5 — Home page](docs/report-screenshots/05-home-page.png)

**Figure 5.6:** Navbar **Categories** dropdown linking to electronics subcategories.

![Figure 5.6 — Categories dropdown](docs/report-screenshots/06-navbar-categories-dropdown.png)

**Figure 5.7:** Navbar **Filters** dropdown exposing sort routes.

![Figure 5.7 — Filters dropdown](docs/report-screenshots/07-navbar-filters-dropdown.png)

**Figure 5.8:** Shop listing filtered to **Phones**.

![Figure 5.8 — Shop Phones category](docs/report-screenshots/08-shop-phones-category.png)

**Figure 5.9:** Example **product detail** page resolved from the Phones listing/API fallback.

![Figure 5.9 — Product detail example](docs/report-screenshots/09-product-detail-example.png)

**Figure 5.10:** Shop page showing **category chips** and **sort filters** with **Popular** sort selected (`/shop?sort=popular`).

![Figure 5.10 — Shop filters and sort](docs/report-screenshots/10-shop-filters-and-sort.png)

**Figure 5.11:** Checkout flow (`/checkout`)—multi-step Volta checkout demo.

![Figure 5.11 — Checkout](docs/report-screenshots/11-checkout.png)

**Figure 5.12:** **Trending electronics** section on the home page (`/api/trending`).

![Figure 5.12 — Trending electronics](docs/report-screenshots/12-trending-electronics-section.png)

**Figure 5.13:** **Recommended for you** section using seeded persona **`user_001`** (`/api/recommendations`).

![Figure 5.13 — Recommended for you](docs/report-screenshots/13-recommended-for-you-section.png)

**Figure 5.14:** Search bar focused—dropdown suggestions (**Trending & picks for you**).

![Figure 5.14 — Search suggestions](docs/report-screenshots/14-search-bar-dropdown-trending.png)

**Figure 5.15:** Search bar after typing **`iphone`**—client-side filtering over fetched catalog.

![Figure 5.15 — Search results](docs/report-screenshots/15-search-bar-results.png)

### 5.6 Implementation Summary

Volta demonstrates an end-to-end **Mongo-backed** storefront with **embedded TF–IDF recommendations**, **popularity trending**, **ratings**, **checkout persistence**, and **admin tooling**. Screenshots document the primary user-visible flows aligned with course expectations for implementation evidence.

---

## 6. Data Analysis, Testing, and Evaluation

### 6.1 Introduction

Testing emphasized **functional workflows** across storefront, APIs, and admin paths, plus **qualitative** validation of recommendation/trending behavior under seeded data. The repository does **not** ship automated offline ranking benchmarks (e.g., precision@K scripts); evaluation statements below remain **process-oriented** rather than reporting fictitious quantitative leaderboard scores.

### 6.2 Testing Strategy

| Testing type | Purpose |
|--------------|---------|
| **Functional testing** | Login/sign-up, shop navigation, PDP loads, checkout POST, ratings upsert, trending/recommendations JSON shapes. |
| **Role-based testing** | Admin allowlist vs normal accounts for `/admin/**` entry. |
| **API testing** | HTTP status codes and JSON fields for core endpoints (`get_products`, `purchases`, `ratings`, `recommendations`, `trending`). |
| **Database verification** | Seeded SKUs present; purchases inserted from checkout script/demo seed; aggregates update after ratings POST. |
| **Usability / visual verification** | Responsive layouts; screenshots captured for report inclusion. |

### 6.3 Representative Functional Checks

| Feature | Action | Expected outcome |
|---------|--------|------------------|
| Trending | Load `/` with seeded purchases | Trending strip renders when `/api/trending` returns rows |
| Recommendations | Set `localStorage.user` to seeded ID with history | Panel renders cards or `insufficient_history` JSON reason |
| Checkout | Submit `/checkout` | `POST /api/purchases` records rows |
| Ratings | `POST /api/ratings` | `ProductRating` upsert + `Product` aggregates refresh |
| Admin | Sign in allowlisted email | Dashboard reachable; non-allowlisted session denied |

### 6.4 Evaluation Summary

Functionally, Volta meets project goals: **catalog + cart + checkout persistence**, **explicit ratings**, **trending**, **personalized recommendations** for users with sufficient purchase rows, and **admin** surfaces. Complexity remains manageable because scoring executes in-process without external ML servers—at the cost of **per-request TF–IDF recomputation** for modest catalogs.

### 6.5 Summary

Testing confirms core workflows operate against MongoDB with seeded/demo data. Future work should add **scripted offline ranking metrics**, performance profiling at larger SKU counts, and hardened security posture beyond demonstration defaults.

---

## 7. Discussion

### 7.1 Overview

Volta illustrates how **content-based similarity** can be embedded directly into a modern **Next.js** deployment target. Compared with manual browsing only, recommendations steer users toward **textually similar electronics** grounded in recent purchases; compared with heavyweight collaborative pipelines, the approach remains **interpretable** and **grading-friendly**.

### 7.2 Trade-Offs

| Design choice | Benefit | Trade-off |
|---------------|---------|-----------|
| **TypeScript in-route scoring** | Simple deployment; typed coupling to Mongoose docs | Less leverage of Python ML ecosystems for experimentation |
| **TF–IDF bag-of-words** | Transparent features | Weak semantics vs embeddings; sensitive to description quality |
| **Electronics-only candidate pool** | Coherent demo narrative | Blocks cross-category recommendations |
| **Popularity/trending adjunct** | Cold-start mitigation | Not personalized; can dominate perception if similarity ties |
| **localStorage user bridging** | Lightweight UX demo | Must converge with canonical identities for production |

### 7.3 Ethical and Data Considerations

Synthetic purchase generators create **demo analytics** not equivalent to real consumer telemetry—reports using seeded dashboards should label data accordingly.

### 7.4 Summary

Volta’s architecture favors **clarity and reproducibility** over cutting-edge modeling. The chosen trade-offs align with seminar scope while leaving a clean extension path toward hybrid models, dense embeddings, and rigorous offline evaluation.

---

## 8. Conclusion and Future Work

### 8.1 Conclusion

This project presented **Volta**, a **Next.js + MongoDB** e-commerce platform with **TF–IDF cosine recommendations**, **trending discovery**, **ratings**, **checkout persistence**, and **admin tooling**. The recommendation runtime is implemented in **TypeScript API routes**, while **Python** supports seeding and offline catalog maintenance—correcting earlier draft language that suggested Python executed online inference.

### 8.2 Limitations

- No shipped **automated offline precision/recall** harness.  
- **Bag-of-words** modeling ignores semantics beyond token overlap.  
- **Electronics filter** constrains recommendation diversity.  
- **Demo credentials** and relaxed payment-field persistence are **not production-ready**.  
- **localStorage** coupling for storefront identity is a simplification.

### 8.3 Future Work

| Enhancement | Expected benefit |
|-------------|------------------|
| Collaborative or graph signals | Stronger personalization when user–item matrix densifies |
| Dense embeddings + ANN index | Better semantic similarity at scale |
| Session-aware models | Capture within-visit intent beyond purchase list |
| Multimodal (image + text) fusion | Leverage product photography already in UI |
| Rigorous offline metrics | Reproducible precision@K/recall@K reporting |
| Security hardening | Remove demo shortcuts; RBAC on server routes |

### 8.4 Final Remarks

Volta demonstrates how **information-retrieval-style scoring** can coexist with a **full-stack web application** suitable for **CPSC-597** demonstration and cloud deployment. Extension toward hybrid recommenders and embedding retrieval is natural given the modular **`recommendationScoring.ts`** boundary.

---

## Bibliography

[1] Next.js Documentation. *Next.js Docs.* Available: https://nextjs.org/docs  

[2] MongoDB, Inc. *MongoDB Manual.* Available: https://www.mongodb.com/docs/manual/  

[3] Mongoose. *Mongoose Documentation.* Available: https://mongoosejs.com/docs/guide.html  

[4] NextAuth.js. *Authentication for Next.js.* Available: https://next-auth.js.org/  

[5] Redux Toolkit. *Official Redux Toolkit Documentation.* Available: https://redux-toolkit.js.org/  

[6] UploadThing. *Documentation.* Available: https://docs.uploadthing.com/  

[7] G. Salton and C. Buckley, “Term-weighting approaches in automatic text retrieval,” *Information Processing & Management*, 1988.  

[8] F. Ricci, L. Rokach, B. Shapira, and P. B. Kantor (eds.), *Recommender Systems Handbook*, Springer.  

[9] C. D. Manning, P. Raghavan, and H. Schütze, *Introduction to Information Retrieval*, Cambridge University Press.  

---

## Appendix A — Glossary

| Term | Meaning |
|------|---------|
| **Prototype purchase** | Recent purchased SKU whose TF–IDF vector seeds similarity |
| **Candidate** | Electronics product not already purchased by the user |
| **Trending** | Popularity shortlist from `/api/trending` |
| **Cold start (thin history)** | Fewer purchases than `MIN_PURCHASES_FOR_RECS` |

---

*Revision notes: Reformatted to align with `Template.pdf` structure using numbered sections **1.–8.** (no “Chapter” headings). Screenshots stored under **`docs/report-screenshots/`**. Regenerate Word: `python scripts/md_to_docx.py` from `Cpsc-597 Final Project`.*
