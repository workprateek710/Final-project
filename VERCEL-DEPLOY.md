# Deploy the Volta storefront on Vercel

Only the **Next.js app** in `ecommerce-nextjs-main` runs on Vercel. **MongoDB** must be **MongoDB Atlas** (or another cloud URL). Recommendations are handled by the Next.js API route, so no separate Flask/Render service is required.

## 1. Prerequisites

1. Push this project to **GitHub** (or GitLab / Bitbucket) if it is not already.
2. Create a **MongoDB Atlas** cluster and a database user. Under **Network Access**, add **`0.0.0.0/0`** (required so Vercel’s serverless IPs can connect), or use Atlas **Private Endpoint** on a paid plan.
3. Make sure the production `MONGO_URI` points at the same database that contains `products` and `purchases`, because recommendations are computed from those collections.

## 2. Create the Vercel project

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import your repository.
2. **Root Directory**: set to **`ecommerce-nextjs-main`** (the folder that contains `package.json` and `next.config.mjs`).  
   If you skip this and the repo root is the parent folder, the build will fail.
3. **Framework Preset**: Next.js (auto-detected).
4. **Build Command**: `npm run build` (default).  
   **Install Command**: `npm install` (default).

## 3. Environment variables (Vercel → Project → Settings → Environment Variables)

Add these for **Production** (and Preview if you want previews to work):

| Name | Example / notes |
|------|------------------|
| `MONGO_URI` | `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/ecommerce-597?retryWrites=true&w=majority` |
| `NEXTAUTH_SECRET` | Long random string, e.g. `openssl rand -base64 32` |
| `NEXTAUTH_URL` | After first deploy: `https://YOUR-PROJECT.vercel.app` (must match the site URL exactly) |
| `UPLOADTHING_SECRET` | From UploadThing dashboard (if you use admin uploads) |
| `UPLOADTHING_APP_ID` | From UploadThing dashboard |
| `GOOGLE_CLIENT_ID` | Optional, for Google sign-in |
| `GOOGLE_CLIENT_SECRET` | Optional |

**Important:** Deploy once with a placeholder `NEXTAUTH_URL` if needed, then set `NEXTAUTH_URL` to the real `https://....vercel.app` URL and **Redeploy** so auth callbacks work.

## 4. Deploy

Click **Deploy**. Fix any build errors using the Vercel build log.

## 5. After deploy

1. **Seed data** (optional): run `npm run db:seed` locally with **production** `MONGO_URI` in `.env`, or run the Python script against Atlas from your machine.
2. **Custom domain** (optional): Vercel → Project → **Domains** → add your domain; then set `NEXTAUTH_URL` to that `https://` URL and redeploy.

## CLI (alternative)

```bash
cd ecommerce-nextjs-main
npx vercel login
npx vercel
npx vercel env pull   # optional: fetch envs locally
npx vercel --prod
```

Set the same environment variables in the Vercel dashboard or via `npx vercel env add`.

## What does not run on Vercel

- **Local MongoDB**: not reachable from Vercel; use Atlas.
