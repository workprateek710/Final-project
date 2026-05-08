import Product from "@/libs/models/Product";
import ProductRating from "@/libs/models/ProductRating";
import { connectMongoDB } from "@/libs/MongoConnect";
import AddToCartButton from "@/components/catalog/AddToCartButton";
import ProductRatingPanel from "@/components/catalog/ProductRatingPanel";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type LeanProduct = {
  prodId: string;
  slug: string;
  name: string;
  imgSrc: string;
  price: string | number;
  description?: string;
  brand?: string;
  subcategory?: string;
  ratingAvg?: number;
  reviews?: number;
  stock?: number;
};

type Props = { params: Promise<{ slug: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  await connectMongoDB();
  const doc = (await Product.findOne({ slug }).lean()) as LeanProduct | null;
  if (!doc) notFound();

  /** Prefer live aggregate from ProductRating so SSR matches DB even when Product counters drift */
  const ratingAgg = (await ProductRating.aggregate<{ avg: number; count: number }>([
    { $match: { prodId: doc.prodId } },
    {
      $group: {
        _id: "$prodId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ])) as { avg: number; count: number }[];

  const aggRow = ratingAgg[0];
  let reviewsCount = doc.reviews ?? 0;
  let displayedAvg: number | null =
    reviewsCount > 0 ? Number(doc.ratingAvg ?? 0) : null;
  if (aggRow && aggRow.count > 0) {
    reviewsCount = aggRow.count;
    displayedAvg = Number(aggRow.avg.toFixed(2));
  }

  const priceNum = Number.parseFloat(String(doc.price)) || 0;
  const stars = displayedAvg !== null ? Math.round(displayedAvg) : 0;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="container py-3 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-accent transition">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-accent transition">Shop</Link>
          {doc.subcategory && (
            <>
              <span>/</span>
              <Link href={`/shop?subcategory=${encodeURIComponent(doc.subcategory)}`} className="hover:text-accent transition">
                {doc.subcategory}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-[200px]">{doc.name}</span>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid gap-10 lg:grid-cols-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          {/* image */}
          <div className="relative h-80 lg:h-[460px] bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
            <Image
              src={doc.imgSrc}
              alt={doc.name}
              fill
              className="object-contain p-8"
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>

          {/* details */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent/8 px-3 py-1 rounded-full">
                {doc.subcategory || "Electronics"}
              </span>
              {doc.brand && (
                <span className="text-xs text-slate-500 font-medium">{doc.brand}</span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 leading-snug">{doc.name}</h1>

            {/* rating summary — only show aggregate when at least one review exists */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-amber-400 text-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      displayedAvg !== null && i < stars ? "opacity-100" : "opacity-25"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-slate-600 text-sm">
                {displayedAvg !== null
                  ? `${displayedAvg.toFixed(1)} · ${reviewsCount} ${reviewsCount === 1 ? "review" : "reviews"}`
                  : "No ratings yet"}
              </span>
            </div>

            <ProductRatingPanel
              prodId={doc.prodId}
              initialRatingAvg={displayedAvg ?? 0}
              initialReviews={reviewsCount}
            />

            <div className="flex items-baseline gap-3 mt-5">
              <span className="text-4xl font-extrabold text-slate-900">${doc.price}</span>
            </div>

            {doc.stock !== undefined && (
              <p className={`text-sm mt-2 font-medium ${doc.stock > 10 ? "text-emerald-600" : doc.stock > 0 ? "text-amber-600" : "text-red-500"}`}>
                {doc.stock > 10 ? `✓ In stock (${doc.stock} units)` : doc.stock > 0 ? `⚠ Only ${doc.stock} left` : "Out of stock"}
              </p>
            )}

            <p className="mt-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
              {doc.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 items-center">
              <AddToCartButton
                prodId={doc.prodId}
                slug={doc.slug}
                name={doc.name}
                imgSrc={doc.imgSrc}
                price={priceNum}
                label="Add to cart"
              />
              <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent transition font-medium">
                ← Back to shop
              </Link>
            </div>

            <p className="text-xs text-slate-300 mt-8 font-mono">ID: {doc.prodId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
