import Product from "@/libs/models/Product";
import { connectMongoDB } from "@/libs/MongoConnect";
import AddToCartButton from "@/components/catalog/AddToCartButton";
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

  const priceNum = Number.parseFloat(String(doc.price)) || 0;

  return (
    <div className="container py-10 grid gap-10 lg:grid-cols-2">
      <div className="relative h-80 lg:h-[420px] bg-gray-50 rounded-xl border border-gray-100">
        <Image
          src={doc.imgSrc as string}
          alt={doc.name as string}
          fill
          className="object-contain p-6"
          priority
          sizes="(max-width:1024px) 100vw, 50vw"
        />
      </div>
      <div>
        <p className="text-sm text-gray-500 uppercase tracking-wide">
          {(doc.subcategory as string) || "Electronics"} · {doc.brand as string}
        </p>
        <h1 className="text-3xl font-bold mt-2">{doc.name as string}</h1>
        <p className="text-2xl font-semibold text-accent mt-4">${doc.price as string}</p>
        <p className="text-sm text-gray-600 mt-2">
          ★ {(doc.ratingAvg as number)?.toFixed(1) ?? "4.5"} · {doc.reviews as number} reviews ·{" "}
          {doc.stock as number} in stock
        </p>
        <p className="mt-6 text-gray-700 leading-relaxed">{doc.description as string}</p>
        <div className="mt-8 flex flex-wrap gap-4 items-center">
          <AddToCartButton
            prodId={doc.prodId as string}
            name={doc.name as string}
            imgSrc={doc.imgSrc as string}
            price={priceNum}
            label="Add to cart"
          />
          <Link href="/shop" className="text-sm text-blue-600 hover:underline">
            ← Back to shop
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-8">Catalog id: {doc.prodId as string}</p>
      </div>
    </div>
  );
}
