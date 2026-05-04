"use client";

import Cart from "@/components/front-end/Cart";
import Footer from "@/components/front-end/Footer";
import Navbar from "@/components/front-end/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type RecommendedProduct = {
  prod_id: string;
  rating: number;
  name: string;
  price: string;
  imgSrc: string;
  slug: string;
  ratingAvg: number;
  reviews: number;
  purchases: number;
  subcategory: string;
};

type BasisRow = {
  prodId: string;
  rating?: number;
  createdAt?: string;
};

export default function RecommendationsPage() {
  const [showCart, setShowCart] = useState(false);
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [basis, setBasis] = useState<BasisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!userId) {
      setMessage("Sign in to see recommendations based on your purchase history.");
      setLoading(false);
      return;
    }

    fetch(`/api/recommendations?user_id=${encodeURIComponent(userId)}&limit=60`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.recommendations ?? []);
        setBasis(data.recommendationBasis ?? []);
        if (data.reason === "insufficient_history") {
          setMessage("Recommendations unlock after you make a purchase.");
        }
      })
      .catch(() => setMessage("Recommendations are temporarily unavailable."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="bg-slate-50 min-h-screen">
      <Navbar setShowCart={setShowCart} />
      {showCart && <Cart setShowCart={setShowCart} />}

      <section className="bg-white border-b border-slate-100">
        <div className="container py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Personalized catalog
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">All recommendations</h1>
          <p className="text-slate-500 text-sm mt-2 max-w-2xl">
            Ranked from your most recent purchase history using TF-IDF and cosine similarity,
            with purchase and review activity used to break close matches.
          </p>
        </div>
      </section>

      <section className="container py-8">
        {basis.length > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900 mb-2">
              Recent purchase signals used
            </p>
            <div className="flex flex-wrap gap-2">
              {basis.slice(0, 10).map((row) => (
                <span
                  key={`${row.prodId}-${row.createdAt}`}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                >
                  {row.prodId}
                  {row.createdAt ? ` · ${new Date(row.createdAt).toLocaleDateString()}` : ""}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading && <p className="text-slate-500">Loading recommendations...</p>}
        {!loading && message && (
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {message}
          </p>
        )}

        {!loading && products.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <Link
                key={product.prod_id}
                href={`/shop/${product.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:border-accent/30 hover:shadow-xl hover:shadow-slate-200/60"
              >
                <div className="relative h-52 bg-slate-50">
                  <Image
                    src={product.imgSrc || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-contain p-4 transition group-hover:scale-105"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white">
                    #{index + 1}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {product.subcategory}
                  </p>
                  <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-accent">
                    {product.name}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{product.purchases} purchases</span>
                    <span>{product.reviews} reviews</span>
                    <span>★ {product.ratingAvg.toFixed(1)}</span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-accent">${product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
