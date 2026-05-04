import Purchase from "@/libs/models/Purchase";
import Product from "@/libs/models/Product";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/purchases/mine?userId=xxx
 *  Returns purchase records enriched with product details, sorted newest-first.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")?.trim();
    if (!userId) return NextResponse.json({ message: "userId required" }, { status: 400 });

    await connectMongoDB();

    const purchases = await Purchase.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!purchases.length) return NextResponse.json({ purchases: [] });

    const prodIds = [...new Set(purchases.map((p) => p.prodId))];
    const products = await Product.find({ prodId: { $in: prodIds } })
      .select("prodId name imgSrc price slug brand subcategory")
      .lean();

    const productMap = Object.fromEntries(products.map((p) => [p.prodId, p]));

    const enriched = purchases.map((p) => ({
      _id: String(p._id),
      prodId: p.prodId,
      rating: p.rating,
      createdAt: p.createdAt,
      product: productMap[p.prodId] ?? null,
    }));

    return NextResponse.json({ purchases: enriched });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}
