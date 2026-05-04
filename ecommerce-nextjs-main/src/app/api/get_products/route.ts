import Product from "@/libs/models/Product";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

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
    const response = NextResponse.json(data);
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
