"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type RecRow = {
  prod_id: string;
  rating: number;
  name?: string;
  price?: string;
  imgSrc?: string;
  slug?: string;
  ratingAvg?: number;
};

/**
 * Personalized strip: Flask SVD + cold-start branch, proxied via `/api/recommendations`.
 * New users (unknown to the matrix) still receive items via the existing popular-items branch.
 */
export default function RecommendationsPanel({ userId }: { userId: string }) {
  const [rows, setRows] = useState<RecRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("/api/recommendations", {
          params: { user_id: userId },
        });
        if (cancelled) return;
        setRows(res.data?.recommendations ?? []);
      } catch {
        setErr("Recommendations unavailable (is Flask running on :5000?).");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <section className="container py-6">
        <p className="text-gray-500">Loading recommendations…</p>
      </section>
    );
  }
  if (err) {
    return (
      <section className="container py-6">
        <p className="text-amber-700 text-sm">{err}</p>
      </section>
    );
  }
  if (!rows.length) return null;

  return (
    <section className="container py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Recommended for you</h2>
      <p className="text-gray-600 text-sm mb-6 max-w-3xl">
        Powered by the same <code className="bg-gray-100 px-1">recommend_items</code> function as
        the Flask service (SVD for known users, popularity fallback for cold start).
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {rows.map((product) => (
          <div key={product.prod_id} className="product-card">
            <div className="relative h-40 w-full">
              <Image
                src={product.imgSrc || "/placeholder.jpg"}
                alt={product.name || product.prod_id}
                fill
                className="object-contain rounded-md"
                sizes="180px"
              />
            </div>
            <p className="product-name">{product.name || product.prod_id}</p>
            <p className="product-rating">
              ★ {(product.ratingAvg ?? product.rating ?? 0).toFixed(1)}
            </p>
            {product.price && <p className="product-price">${product.price}</p>}
            {product.slug && (
              <Link href={`/shop/${product.slug}`} className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                View product
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
