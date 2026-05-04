const Footer = () => {
  return (
    <div className="bg-slate-50 border-t border-slate-200 mt-16">
      <div className="mx-auto w-full max-w-screen-xl">
        <div className="grid grid-cols-2 gap-8 px-4 py-10 lg:py-12 md:grid-cols-4">
          <div>
            <h2 className="mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</h2>
            <ul className="text-slate-600 text-sm space-y-3">
              <li>
                <a href="#" className="hover:text-accent">
                  About Volta
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Press
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Help</h2>
            <ul className="text-slate-600 text-sm space-y-3">
              <li>
                <a href="#" className="hover:text-accent">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Shipping
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Returns
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Legal</h2>
            <ul className="text-slate-600 text-sm space-y-3">
              <li>
                <a href="#" className="hover:text-accent">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Terms
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Volta</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Electronics storefront demo — MongoDB catalog, purchase-driven trending, Flask recommendations.
            </p>
          </div>
        </div>
        <div className="px-4 py-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span className="text-sm text-slate-500">© 2026 Volta Electronics. Course project.</span>
          <div className="flex gap-4 text-slate-400">
            <span className="sr-only">Social</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
