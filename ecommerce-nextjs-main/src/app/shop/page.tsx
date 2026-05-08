import Product from "@/libs/models/Product";
import Purchase from "@/libs/models/Purchase";
import { connectMongoDB } from "@/libs/MongoConnect";
import ProductTile, { type TileProduct } from "@/components/catalog/ProductTile";
import { effectiveRatings, ratingRollupMap } from "@/utils/productRatingRollup";
import Link from "next/link";
import { SORT_OPTIONS, parseSortOption } from "@/constants/catalogFilters";

export const dynamic = "force-dynamic";

type Props = {
  searchParams:
    | Promise<{ subcategory?: string; sort?: string }>
    | { subcategory?: string; sort?: string };
};

export default async function ShopPage({ searchParams }: Props) {
  const sp = await Promise.resolve(searchParams);
  const subcategory = sp?.subcategory;
  const sort = parseSortOption(sp?.sort);
  await connectMongoDB();
  const filter: Record<string, string> = { category: "Electronics" };
  if (subcategory) filter.subcategory = subcategory;

  const [raw, allSubcategories, purchaseRows] = await Promise.all([
    Product.find(filter).sort({ featured: -1, name: 1 }).lean(),
    Product.distinct("subcategory", { category: "Electronics" }),
    Purchase.aggregate<{ _id: string; purchases: number }>([
      { $group: { _id: "$prodId", purchases: { $sum: 1 } } },
    ]),
  ]);
  const purchaseCounts = new Map(purchaseRows.map((row) => [row._id, row.purchases]));
  const prodIds = raw.map((d) => String(d.prodId ?? ""));
  const rollup = await ratingRollupMap(prodIds);
  const items: TileProduct[] = raw.map((doc) => {
    const prodId = String(doc.prodId ?? "");
    const { ratingAvg, reviews } = effectiveRatings(prodId, doc, rollup);
    return {
      prodId,
      slug: doc.slug as string,
      name: doc.name as string,
      imgSrc: doc.imgSrc as string,
      category: doc.category as string,
      subcategory: (doc.subcategory as string) || "General",
      price: String(doc.price),
      ratingAvg: reviews > 0 ? ratingAvg : undefined,
      reviews: reviews > 0 ? reviews : undefined,
    };
  });
  const sortedItems = [...items].sort((a, b) => {
    if (sort === "popular") {
      return (purchaseCounts.get(b.prodId) ?? 0) - (purchaseCounts.get(a.prodId) ?? 0);
    }
    if (sort === "reviews") {
      return (b.reviews ?? 0) - (a.reviews ?? 0);
    }
    if (sort === "rating") {
      return (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0);
    }
    if (sort === "price-low") {
      return (Number(a.price) || 0) - (Number(b.price) || 0);
    }
    if (sort === "price-high") {
      return (Number(b.price) || 0) - (Number(a.price) || 0);
    }
    return 0;
  });
  const subcategories = Array.from(
    new Set(allSubcategories.filter(Boolean).map(String))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {subcategory ? subcategory : "All Electronics"}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {sortedItems.length} product{sortedItems.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* filter pills */}
        <div id="categories" className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Categories
          </p>
          <div className="flex flex-wrap gap-2">
          <Link
            href={sort ? `/shop?sort=${sort}` : "/shop"}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
              !subcategory
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}
          >
            All
          </Link>
          {subcategories.map((s) => (
            <Link
              key={s}
              href={`/shop?subcategory=${encodeURIComponent(s)}${sort ? `&sort=${sort}` : ""}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                subcategory === s
                  ? "bg-accent text-white border-accent"
                  : "bg-white text-slate-600 border-slate-200 hover:border-accent hover:text-accent"
              }`}
            >
              {s}
            </Link>
          ))}
          </div>
        </div>

        <div id="filters" className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Filters
          </p>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((option) => (
              <Link
                key={option.value}
                href={`/shop?${subcategory ? `subcategory=${encodeURIComponent(subcategory)}&` : ""}sort=${option.value}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  sort === option.value
                    ? "border-accent bg-accent text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-accent hover:text-accent"
                }`}
              >
                {option.label}
              </Link>
            ))}
            {sort && (
              <Link
                href={subcategory ? `/shop?subcategory=${encodeURIComponent(subcategory)}` : "/shop"}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 hover:border-slate-400"
              >
                Clear sort
              </Link>
            )}
          </div>
        </div>

        {/* grid */}
        {sortedItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-slate-600 font-medium">No products found in this category.</p>
            <Link href="/shop" className="text-accent text-sm mt-2 inline-block hover:underline">
              Browse all electronics
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedItems.map((p) => (
              <ProductTile key={p.prodId} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
