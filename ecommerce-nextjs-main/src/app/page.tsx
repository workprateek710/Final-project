"use client";

import Banner from "@/components/front-end/Banner";
import Cart from "@/components/front-end/Cart";
import Feature from "@/components/front-end/Feature";
import Footer from "@/components/front-end/Footer";
import Hero from "@/components/front-end/Hero";
import Navbar from "@/components/front-end/Navbar";
import RecommendationsPanel from "@/components/front-end/RecommendationsPanel";
import TrendingStrip from "@/components/front-end/TrendingStrip";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [showCart, setShowCart] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(typeof window !== "undefined" ? localStorage.getItem("user") : null);
  }, []);

  return (
    <main className="bg-white">
      <Navbar setShowCart={setShowCart} />
      {showCart && <Cart setShowCart={setShowCart} />}

      <Hero />
      <TrendingStrip />

      {userId ? (
        <RecommendationsPanel userId={userId} />
      ) : (
        <section className="container py-10">
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Get personalised recommendations</h2>
              <p className="text-slate-300 text-sm mt-1 max-w-lg">
                Sign in to see AI-powered picks based on your purchase history, powered by our Flask SVD recommender.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/login" className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 px-6 py-2.5 text-sm font-semibold hover:bg-slate-100 transition">
                Sign in
              </Link>
              <Link href="/signup" className="inline-flex items-center justify-center rounded-xl bg-accent text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-600 transition">
                Create account
              </Link>
            </div>
          </div>
        </section>
      )}

      <Feature />
      <Banner />
      <Footer />
    </main>
  );
}
