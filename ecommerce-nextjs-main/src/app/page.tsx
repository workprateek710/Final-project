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
    <main>
      <Navbar setShowCart={setShowCart} />
      {showCart && <Cart setShowCart={setShowCart} />}
      <Hero />
      <section className="container py-8 flex flex-wrap gap-4 items-center justify-between border-b border-slate-100">
        <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
          Volta (2026): MongoDB stores products, registered users, and every checkout line. Trending appears
          automatically from purchase volume. Start the Flask service on port{" "}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">5000</code> for personalized
          recommendations.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center rounded-xl bg-slate-900 text-white px-6 py-2.5 text-sm font-semibold hover:bg-accent transition shadow-md"
        >
          Shop catalog
        </Link>
      </section>
      <TrendingStrip />
      {userId ? (
        <RecommendationsPanel userId={userId} />
      ) : (
        <section className="container py-6 text-sm text-slate-600">
          <p>
            <Link href="/login" className="text-accent font-semibold hover:underline">
              Sign in
            </Link>{" "}
            with your registered email to see personalized picks. New accounts appear in the{" "}
            <code className="bg-slate-100 px-1 rounded">users</code> collection in MongoDB Compass. After you buy
            items, trending updates from your purchase history.
          </p>
        </section>
      )}
      <Feature />
      <Banner />
      <Footer />
    </main>
  );
}
