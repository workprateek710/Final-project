import Product from "@/libs/models/Product";
import { connectMongoDB } from "@/libs/MongoConnect";
import ProductTile, { type TileProduct } from "@/components/catalog/ProductTile";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ subcategory?: string }> | { subcategory?: string } };

export default async function ShopPage({ searchParams }: Props) {
  const sp = await Promise.resolve(searchParams);
  const subcategory = sp?.subcategory;
  await connectMongoDB();
  const filter: Record<string, string> = { category: "Electronics" };
  if (subcategory) filter.subcategory = subcategory;

  const raw = await Product.find(filter).sort({ featured: -1, name: 1 }).lean();
  const items: TileProduct[] = raw.map((doc) => ({
    prodId: doc.prodId as string,
    slug: doc.slug as string,
    name: doc.name as string,
    imgSrc: doc.imgSrc as string,
    category: doc.category as string,
    subcategory: (doc.subcategory as string) || "General",
    price: String(doc.price),
    ratingAvg: doc.ratingAvg as number | undefined,
    reviews: doc.reviews as number | undefined,
  }));
  const subcategories = Array.from(
    new Set(items.map((item) => item.subcategory).filter(Boolean))
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
            {items.length} product{items.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/shop"
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
              href={`/shop?subcategory=${encodeURIComponent(s)}`}
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

        {/* grid */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-slate-600 font-medium">No products found in this category.</p>
            <Link href="/shop" className="text-accent text-sm mt-2 inline-block hover:underline">
              Browse all electronics
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <ProductTile key={p.prodId} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
