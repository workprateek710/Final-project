"use client";

import React, { Dispatch, SetStateAction, useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { AiOutlineShoppingCart, AiOutlineUser } from "react-icons/ai";
import { BsSearch } from "react-icons/bs";
import { addToCart } from "@/redux/features/cartSlice";
import Link from "next/link";
import type { CatalogProduct } from "@/types/product";
import { ELECTRONICS_SUBCATEGORIES } from "@/constants/productCategories";
import { SORT_OPTIONS } from "@/constants/catalogFilters";

type NavbarProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  reviews: number;
  rating: number;
  slug: string;
};

function mapCatalog(p: CatalogProduct): NavbarProduct {
  return {
    id: p.prodId,
    name: p.name,
    category: p.subcategory || p.category,
    price: Number.parseFloat(p.price) || 0,
    imageUrl: p.imgSrc,
    reviews: p.reviews ?? 0,
    rating: p.ratingAvg ?? 4.5,
    slug: p.slug,
  };
}

type TrendRow = { prodId: string; slug: string; name: string; imgSrc: string; price: string };
type RecRow = { prod_id: string; name?: string; imgSrc?: string; slug?: string; price?: string };

const Navbar = ({ setShowCart }: { setShowCart: Dispatch<SetStateAction<boolean>> }) => {
  const cartCount = useAppSelector((state) => state.cartReducer.length);
  const dispatch = useAppDispatch();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionProducts, setSuggestionProducts] = useState<NavbarProduct[]>([]);
  const [catalog, setCatalog] = useState<NavbarProduct[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const isLoggedIn = currentUser;

  useEffect(() => {
    setIsHydrated(true);
    setCurrentUser(localStorage.getItem("user"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/get_products?category=Electronics", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as CatalogProduct[];
        if (!cancelled) setCatalog(data.map(mapCatalog));
      } catch {
        /* optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadSuggestions = useCallback(async () => {
    const userId =
      typeof window !== "undefined" ? localStorage.getItem("user")?.trim() || "guest_volta" : "guest_volta";
    try {
      const [tRes, rRes] = await Promise.all([
        fetch("/api/trending", { cache: "no-store" }),
        fetch(`/api/recommendations?user_id=${encodeURIComponent(userId)}`, { cache: "no-store" }),
      ]);
      const tJson = await tRes.json().catch(() => ({}));
      const rJson = await rRes.json().catch(() => ({}));
      const seen = new Set<string>();
      const merged: NavbarProduct[] = [];

      for (const row of (tJson.trending ?? []) as TrendRow[]) {
        if (!row?.prodId || seen.has(row.prodId)) continue;
        seen.add(row.prodId);
        merged.push({
          id: row.prodId,
          name: row.name,
          category: "Trending",
          price: Number.parseFloat(String(row.price)) || 0,
          imageUrl: row.imgSrc,
          reviews: 0,
          rating: 5,
          slug: row.slug,
        });
      }
      for (const row of (rJson.recommendations ?? []) as RecRow[]) {
        const id = row?.prod_id;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        merged.push({
          id,
          name: row.name || id,
          category: "Recommended",
          price: Number.parseFloat(String(row.price ?? "0")) || 0,
          imageUrl: row.imgSrc || "/placeholder.jpg",
          reviews: 0,
          rating: 4.5,
          slug: row.slug || id,
        });
      }
      setSuggestionProducts(merged.slice(0, 10));
    } catch {
      /* keep prior suggestions */
    }
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    if (!normalizedSearch) return [];
    return catalog.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch)
    );
  }, [catalog, normalizedSearch]);

  const handleAddToCart = (product: NavbarProduct) => {
    dispatch(
      addToCart({
        id: product.id,
        title: product.name,
        img: product.imageUrl,
        price: product.price,
        quantity: 1,
      })
    );
    setShowCart(true);
  };

  const showDropdown = searchFocused && (filteredProducts.length > 0 || (!searchQuery.trim() && suggestionProducts.length > 0));
  const dropdownItems = searchQuery.trim() ? filteredProducts : suggestionProducts;
  const dropdownTitle = searchQuery.trim() ? "Search results" : "Trending & picks for you";

  const dropdownPanel = showDropdown && (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-40 max-h-96 overflow-y-auto">
      <p className="text-[11px] uppercase tracking-wider text-slate-400 px-3 pt-2 pb-1 font-semibold">
        {dropdownTitle}
      </p>
      {dropdownItems.map((product) => (
        <div
          key={product.id}
          className="p-3 flex items-center border-t border-slate-50 hover:bg-slate-50 cursor-pointer gap-3 first:border-t-0"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAddToCart(product)}
        >
          <img
            src={product.imageUrl}
            alt=""
            className="w-12 h-12 object-cover rounded-lg border border-slate-100 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-900 truncate">{product.name}</p>
            <p className="text-slate-500 text-xs">{product.category}</p>
            <p className="text-accent font-bold text-sm">${product.price}</p>
          </div>
          <Link
            href={`/shop/${product.slug}`}
            className="text-xs font-medium text-slate-600 hover:text-accent shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            View
          </Link>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pt-4 bg-white/95 backdrop-blur-sm top-0 sticky z-30 border-b border-slate-100 shadow-sm">
      <div className="container">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-3">
          <Link href="/" className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 shrink-0">
            Volta<span className="text-accent">.</span>
          </Link>

          <div className="relative flex-1 max-w-[520px] hidden lg:block min-w-0">
            <div className="flex rounded-xl overflow-hidden border-2 border-slate-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition shadow-sm">
              <input
                className="flex-1 px-4 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none bg-white min-w-0"
                type="text"
                placeholder="Search electronics…"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => {
                  setSearchFocused(true);
                  void loadSuggestions();
                }}
                onBlur={() => {
                  window.setTimeout(() => setSearchFocused(false), 200);
                }}
                aria-autocomplete="list"
              />
              <div className="bg-accent text-white text-xl grid place-items-center px-4 shrink-0" aria-hidden>
                <BsSearch />
              </div>
            </div>

            {dropdownPanel}
          </div>

          <div className="flex gap-3 md:gap-6 items-center shrink-0">
            <div className="hidden md:flex gap-3 items-center">
              {isLoggedIn ? (
                <>
                  <Link href="/profile" className="rounded-full border-2 border-slate-200 text-slate-400 text-2xl w-11 h-11 grid place-items-center bg-slate-50 hover:border-accent hover:text-accent transition">
                    <AiOutlineUser />
                  </Link>
                  <div className="max-w-[140px]">
                    <p className="text-slate-500 text-xs">Signed in</p>
                    <Link href="/profile" className="font-medium text-sm text-slate-800 truncate hover:text-accent transition block">{String(isLoggedIn)}</Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("user");
                      setCurrentUser(null);
                      window.location.href = "/login";
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-xl bg-accent px-5 py-3 text-base font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg px-3 py-2"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              className="text-slate-600 text-3xl relative cursor-pointer p-1 rounded-lg hover:bg-slate-50"
              onClick={() => setShowCart(true)}
              aria-label="Open cart"
            >
              <AiOutlineShoppingCart />
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold min-w-[22px] h-[22px] px-1 rounded-full grid place-items-center">
                {isHydrated ? cartCount : "0"}
              </span>
            </button>
          </div>
          </div>

          <div className="relative w-full lg:hidden min-w-0">
            <div className="flex rounded-xl overflow-hidden border-2 border-slate-200 focus-within:border-accent transition">
              <input
                className="flex-1 px-3 py-2.5 text-sm text-slate-800 outline-none bg-white min-w-0"
                type="text"
                placeholder="Search electronics…"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => {
                  setSearchFocused(true);
                  void loadSuggestions();
                }}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 200)}
              />
              <div className="bg-accent text-white text-lg grid place-items-center px-3 shrink-0">
                <BsSearch />
              </div>
            </div>
            {dropdownPanel}
          </div>
        </div>

        {/* z-50: search dropdown (z-40) can grow tall and overlap this row; keep nav links clickable */}
        <div className="relative z-50 pt-3 pb-2">
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
            <Link href="/" className="text-slate-600 hover:text-accent">
              Home
            </Link>
            <Link href="/shop" className="text-base font-bold text-slate-900 hover:text-accent md:text-lg">
              All Products
            </Link>
            <details className="group relative">
              <summary className="list-none cursor-pointer text-slate-600 hover:text-accent">
                Categories
              </summary>
              <div className="absolute left-0 top-full z-50 mt-2 grid w-56 grid-cols-1 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                {ELECTRONICS_SUBCATEGORIES.filter((category) => category !== "General").map((category) => (
                  <Link
                    key={category}
                    href={`/shop?subcategory=${encodeURIComponent(category)}`}
                    className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-accent"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </details>
            <details className="group relative">
              <summary className="list-none cursor-pointer text-slate-600 hover:text-accent">
                Filters
              </summary>
              <div className="absolute left-0 top-full z-50 mt-2 grid w-56 grid-cols-1 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                {SORT_OPTIONS.map((option) => (
                  <Link
                    key={option.value}
                    href={`/shop?sort=${option.value}`}
                    className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-accent"
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </details>
            <Link href="/checkout" className="text-slate-600 hover:text-accent">
              Checkout
            </Link>
            {isLoggedIn && (
              <Link href="/profile" className="text-slate-600 hover:text-accent">
                My Profile
              </Link>
            )}
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-700 ml-auto text-xs uppercase tracking-wide">
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
