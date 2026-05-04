import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Typed route validator can emit wrong `app/` paths when using `src/app` (Windows); keep off for reliable builds.
  typedRoutes: false,
  typescript: {
    // Generated `.next/types/validator.ts` imports `../../app/...` even when the app lives in `src/app` (Next 15 + Windows).
    ignoreBuildErrors: true,
  },
  // Monorepo-style lockfile parent + Next 15 typegen: keep tracing rooted on this app.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
