import dynamic from "next/dynamic";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />

      <div className="container relative grid md:grid-cols-2 gap-10 py-16 md:py-24 items-center">
        {/* text */}
        <div className="space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            New arrivals for 2026
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            The best<br />
            <span className="text-accent">electronics</span><br />
            for every need
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed">
            Flagship phones, gaming gear, pro cameras and more — all in one place.
            <span className="text-red-400 font-semibold"> Up to 10% off</span> select items this week.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-xl bg-accent text-white px-8 py-3.5 font-semibold text-sm hover:bg-blue-600 transition shadow-lg shadow-accent/30"
            >
              Shop electronics
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl border border-slate-600 text-slate-200 px-6 py-3.5 font-semibold text-sm hover:border-slate-400 hover:text-white transition"
            >
              Create account
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-2 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Free shipping
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              30-day returns
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              2-year warranty
            </span>
          </div>
        </div>

        {/* image */}
        <div className="flex justify-center md:justify-end relative">
          <div className="absolute inset-0 bg-accent/5 rounded-3xl blur-3xl" />
          <img
            className="relative max-h-[360px] w-auto object-contain drop-shadow-2xl"
            src="/hero.png"
            alt="Electronics hero"
          />
        </div>
      </div>
    </section>
  );
};

export default dynamic(() => Promise.resolve(Hero), { ssr: false });
