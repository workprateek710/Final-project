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
  return (
    <article className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <Link href={`/shop/${p.slug}`} className="block border-b border-gray-100 bg-gray-50">
        <div className="relative h-48 w-full">
          <Image
            src={p.imgSrc}
            alt={p.name}
            fill
            className="object-contain p-2"
            sizes="(max-width:768px) 100vw, 25vw"
          />
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {p.subcategory}
        </p>
        <Link href={`/shop/${p.slug}`}>
          <h2 className="font-semibold text-gray-900 hover:text-accent line-clamp-2">
            {p.name}
          </h2>
        </Link>
        <p className="text-sm text-gray-600">
          ★ {p.ratingAvg?.toFixed(1) ?? "4.5"} ({p.reviews ?? 0} reviews)
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-xl font-bold text-accent">${p.price}</span>
          <AddToCartButton
            prodId={p.prodId}
            name={p.name}
            imgSrc={p.imgSrc}
            price={priceNum}
          />
        </div>
      </div>
    </article>
  );
}
