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

  const subs = ["Phones", "Laptops", "Audio", "Tablets", "TV", "Gaming", "Accessories", "Monitors"];

  return (
    <div className="container py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Electronics shop</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Browse in-stock devices. Cart & checkout write to MongoDB so the
          recommender can learn from real (demo) purchase signals.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/shop"
          className={`px-3 py-1 rounded-full border text-sm ${!subcategory ? "bg-black text-white border-black" : "border-gray-300"}`}
        >
          All electronics
        </Link>
        {subs.map((s) => (
          <Link
            key={s}
            href={`/shop?subcategory=${encodeURIComponent(s)}`}
            className={`px-3 py-1 rounded-full border text-sm ${
              subcategory === s ? "bg-black text-white border-black" : "border-gray-300"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">
          No products found. Run <code className="bg-gray-100 px-1">npm run db:seed</code> after
          setting <code className="bg-gray-100 px-1">MONGO_URI</code>.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProductTile key={p.prodId} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
