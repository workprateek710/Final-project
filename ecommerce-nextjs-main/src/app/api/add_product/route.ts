import Product from "@/libs/models/Product";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "product"}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      imgSrc,
      fileKey,
      name,
      category,
      price,
      prodId: bodyProdId,
      slug: bodySlug,
      subcategory,
      description,
      brand,
      ratingAvg,
      reviews,
      stock,
      featured,
    } = body;

    await connectMongoDB();
    const prodId =
      typeof bodyProdId === "string" && bodyProdId.trim()
        ? bodyProdId.trim()
        : `elec-${Date.now().toString(36)}`;
    const slug =
      typeof bodySlug === "string" && bodySlug.trim()
        ? bodySlug.trim()
        : slugify(name);

    const data = await Product.create({
      imgSrc,
      fileKey,
      name,
      category,
      price,
      prodId,
      slug,
      subcategory: subcategory ?? "General",
      description: description ?? "",
      brand: brand ?? "",
      ratingAvg: ratingAvg ?? 4.5,
      reviews: reviews ?? 0,
      stock: stock ?? 0,
      featured: Boolean(featured),
    });
    return NextResponse.json({ message: "Product Added Successfully", data });
  } catch (error) {
    return NextResponse.json(
      { error: String(error), message: "Something Went Wrong" },
      { status: 400 }
    );
  }
}
