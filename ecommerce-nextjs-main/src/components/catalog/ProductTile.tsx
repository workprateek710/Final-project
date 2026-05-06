import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

export type TileProduct = {
  prodId: string;
  slug: string;
  name: string;
  imgSrc: string;
  category: string;
  subcategory: string;
  price: string;
  ratingAvg?: number;
  reviews?: number;
};

export default function ProductTile({ p }: { p: TileProduct }) {
  const priceNum = Number.parseFloat(p.price) || 0;
  const reviewsCount = p.reviews ?? 0;
  const rating = reviewsCount > 0 ? Number(p.ratingAvg ?? 0) : null;
  const stars = rating !== null ? Math.round(rating) : 0;

  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-slate-100 hover:border-accent/30 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-200 overflow-hidden">
      {/* image */}
      <Link href={`/shop/${p.slug}`} className="block relative bg-slate-50 overflow-hidden">
        <div className="relative h-52 w-full">
          <Image
            src={p.imgSrc}
            alt={p.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        </div>
        {/* subcategory badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-600 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border border-slate-200">
          {p.subcategory}
        </span>
      </Link>

      {/* info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <Link href={`/shop/${p.slug}`}>
          <h2 className="font-semibold text-slate-900 hover:text-accent transition line-clamp-2 text-sm leading-snug">
            {p.name}
          </h2>
        </Link>

        {/* stars */}
        <div className="flex items-center gap-1.5">
          <div className="flex text-amber-400 text-xs">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={rating !== null && i < stars ? "opacity-100" : "opacity-25"}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-slate-400 text-xs">
            {rating !== null ? `${rating.toFixed(1)} (${reviewsCount})` : "No ratings yet"}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-slate-50">
          <span className="text-xl font-bold text-slate-900">${p.price}</span>
          <AddToCartButton
            prodId={p.prodId}
            slug={p.slug}
            name={p.name}
            imgSrc={p.imgSrc}
            price={priceNum}
          />
        </div>
      </div>
    </article>
  );
}
