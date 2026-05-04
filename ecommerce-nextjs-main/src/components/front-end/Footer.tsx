import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-8">
      <div className="container">
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          {/* brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-white tracking-tight">
              Volta<span className="text-accent">.</span>
            </Link>
            <p className="text-sm mt-3 leading-relaxed max-w-[200px]">
              Electronics storefront built with Next.js, MongoDB, and Flask services.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              {["Phones", "Laptops", "Audio", "Gaming", "Cameras"].map((s) => (
                <li key={s}>
                  <Link href={`/shop?subcategory=${s}`} className="hover:text-white transition">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              {["About", "Careers", "Press", "Support", "Returns"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-sm">© 2026 Volta Electronics. CPSC-597 course project.</span>
          <div className="flex gap-2 text-xs">
            <span className="bg-slate-800 px-2 py-1 rounded">Next.js 15</span>
            <span className="bg-slate-800 px-2 py-1 rounded">MongoDB</span>
            <span className="bg-slate-800 px-2 py-1 rounded">Flask API</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
