/**
 * Wikimedia often blocks or mis-serves Next.js image optimizer fetches.
 * Bypass optimization for those URLs so the browser loads the asset directly.
 */
export function shouldUseUnoptimizedImage(src: string | undefined | null): boolean {
  if (!src || src.startsWith("/")) return false;
  try {
    const u = new URL(src);
    return u.hostname === "upload.wikimedia.org";
  } catch {
    return false;
  }
}
