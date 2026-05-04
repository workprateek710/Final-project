import dynamic from "next/dynamic";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="bg-gradient-to-br from-slate-100 via-white to-emerald-50/30 mt-2 rounded-b-3xl overflow-hidden">
      <div className="container grid md:grid-cols-2 gap-8 py-12 md:py-16 items-center">
        <div className="space-y-5 max-w-xl">
          <p className="text-sm font-medium text-slate-600">
            Starting at <span className="text-slate-900 font-bold">$89</span> accessories · flagship phones from{" "}
            <span className="text-slate-900 font-bold">$899</span>
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            The best electronics for <span className="text-accent">2026</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            New year offers <span className="text-red-600 font-bold">up to 10% off</span> select gear this week.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white px-8 py-3.5 font-semibold text-sm hover:bg-accent transition shadow-lg shadow-slate-900/15"
            >
              Shop electronics
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl border-2 border-slate-300 text-slate-800 px-6 py-3.5 font-semibold text-sm hover:border-accent hover:text-accent transition"
            >
              Create account
            </Link>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <img className="max-h-[320px] w-auto object-contain drop-shadow-2xl" src="/hero.png" alt="Hero" />
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Hero), { ssr: false });
