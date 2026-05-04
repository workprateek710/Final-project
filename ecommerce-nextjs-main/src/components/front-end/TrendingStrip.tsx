"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type TrendRow = {
  prodId: string;
  slug: string;
  name: string;
  imgSrc: string;
  price: string;
  purchases: number;
  avgRating: number;
};

/**
 * Purchase-weighted popularity — hidden until there is at least one purchase in MongoDB.
 */
export default function TrendingStrip() {
  const [rows, setRows] = useState<TrendRow[]>([]);
  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/trending", { cache: "no-store" });
        const data = await res.json();
        setRows(data.trending ?? []);
      } catch {
        setErr("Could not load trending.");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (err) return <p className="text-center text-red-500 py-4 text-sm">{err}</p>;
  if (!ready || rows.length === 0) return null;

  return (
    <section className="container py-10">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Trending electronics</h2>
          <p className="text-slate-600 text-sm mt-1">
            Driven by real checkout activity in MongoDB — the more customers buy an item, the higher it ranks here.
          </p>
        </div>
        <Link href="/shop" className="text-sm font-semibold text-accent hover:underline shrink-0">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rows.map((t) => (
          <Link
            key={t.prodId}
            href={`/shop/${t.slug}`}
            className="border border-slate-200 rounded-xl p-3 bg-white hover:shadow-lg hover:border-accent/30 transition group"
          >
            <div className="relative h-28 w-full bg-slate-50 rounded-lg overflow-hidden">
              <Image src={t.imgSrc} alt={t.name} fill className="object-contain p-1" sizes="200px" />
            </div>
            <p className="font-semibold text-sm mt-2 line-clamp-2 text-slate-900 group-hover:text-accent transition">
              {t.name}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t.purchases} purchases</p>
            <p className="text-accent font-bold text-sm mt-1">${t.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
