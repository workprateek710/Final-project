import React from "react";
import Link from "next/link";

const Banner = () => {
  return (
    <section className="container py-12">
      <div className="grid lg:grid-cols-[2fr,1fr] gap-4">
        <div className="relative h-[220px] md:h-[280px] bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl overflow-hidden p-8 md:p-12 flex flex-col justify-center">
          {/* decorative circle */}
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
          <p className="text-accent text-sm font-semibold uppercase tracking-wider mb-2">Limited time</p>
          <h2 className="text-white font-bold text-2xl md:text-3xl max-w-[280px] leading-tight">
            Save 20% on flagship phones & accessories
          </h2>
          <Link
            href="/shop?subcategory=Phones"
            className="inline-flex items-center mt-6 bg-white text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition w-fit"
          >
            Browse phones →
          </Link>
        </div>

        <div className="relative h-[220px] md:h-[280px] bg-gradient-to-br from-accent to-blue-700 rounded-2xl overflow-hidden p-8 flex flex-col justify-center">
          <div className="absolute -right-8 -bottom-8 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-2">Gaming week</p>
          <h2 className="text-white font-bold text-2xl leading-tight max-w-[200px]">
            Top gaming gear on sale
          </h2>
          <Link
            href="/shop?subcategory=Gaming"
            className="inline-flex items-center mt-6 bg-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-white/30 transition w-fit backdrop-blur-sm border border-white/20"
          >
            Shop gaming →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Banner;
