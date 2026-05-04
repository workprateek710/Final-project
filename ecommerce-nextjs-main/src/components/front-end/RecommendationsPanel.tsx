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

export default function RecommendationsPanel({ userId }: { userId: string }) {
  const [rows, setRows] = useState<RecRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("/api/recommendations", { params: { user_id: userId } });
        if (cancelled) return;
        setRows(res.data?.recommendations ?? []);
      } catch {
        setErr("Recommendations unavailable — Flask service may be sleeping, try again in a moment.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) {
    return (
      <section className="container py-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="skeleton h-7 w-56 mb-2" />
            <div className="skeleton h-4 w-80" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden">
              <div className="skeleton h-32 w-full" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (err) {
    return (
      <section className="container py-6">
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 inline-block">{err}</p>
      </section>
    );
  }

  if (!rows.length) return null;

  return (
    <section className="container py-10">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Recommended for you</h2>
          <p className="text-slate-500 text-sm mt-1">
            Personalised by our Flask SVD recommender based on your purchase history.
          </p>
        </div>
        <Link href="/shop" className="text-sm font-semibold text-accent hover:underline shrink-0">
          Browse all
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {rows.map((product) => (
          <Link
            key={product.prod_id}
            href={product.slug ? `/shop/${product.slug}` : "/shop"}
            className="border border-slate-200 rounded-2xl p-3 bg-white hover:shadow-lg hover:border-accent/30 transition group"
          >
            <div className="relative h-28 w-full bg-slate-50 rounded-xl overflow-hidden mb-3">
              <Image
                src={product.imgSrc || "/placeholder.jpg"}
                alt={product.name || product.prod_id}
                fill
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                sizes="200px"
              />
            </div>
            <p className="font-semibold text-sm line-clamp-2 text-slate-900 group-hover:text-accent transition leading-snug">
              {product.name || product.prod_id}
            </p>
            <p className="text-xs text-amber-500 mt-1">
              ★ {(product.ratingAvg ?? product.rating ?? 0).toFixed(1)}
            </p>
            {product.price && (
              <p className="text-accent font-bold text-sm mt-1">${product.price}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
