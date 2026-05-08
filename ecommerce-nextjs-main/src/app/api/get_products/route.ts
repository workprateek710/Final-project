import Product from "@/libs/models/Product";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";
import { effectiveRatings, ratingRollupMap } from "@/utils/productRatingRollup";

/**
 * Catalog listing. Query params:
 * - category: e.g. "Electronics"
 * - subcategory: e.g. "Phones"
 * - featured: "1" for featured-only
 */
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const featured = searchParams.get("featured");

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (featured === "1") filter.featured = true;

    const data = await Product.find(filter).sort({ name: 1 }).lean();
    const prodIds = data.map((d) => String((d as { prodId?: string }).prodId ?? ""));
    const rollup = await ratingRollupMap(prodIds);
    const merged = data.map((doc) => {
      const d = doc as {
        prodId?: string;
        ratingAvg?: number;
        reviews?: number;
      };
      const prodId = String(d.prodId ?? "");
      const { ratingAvg, reviews } = effectiveRatings(prodId, d, rollup);
      return { ...doc, ratingAvg, reviews };
    });
    const response = NextResponse.json(merged);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: String(error), message: "Something Went Wrong" },
      { status: 400 }
    );
  }
}
