import Product from "@/libs/models/Product";
import Purchase from "@/libs/models/Purchase";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextResponse } from "next/server";
import { effectiveRatings, ratingRollupMap } from "@/utils/productRatingRollup";

/**
 * "Trending" = most-purchased prodIds in the last window, joined to Product.
 * Shown on the home page for guests / cold-start UX copy.
 */
export async function GET() {
  try {
    await connectMongoDB();
    const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const agg = await Purchase.aggregate<{
      _id: string;
      purchases: number;
    }>([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: "$prodId",
          purchases: { $sum: 1 },
        },
      },
      { $sort: { purchases: -1 } },
      { $limit: 8 },
    ]);

    const prodIds = agg.map((a) => a._id);
    const products = await Product.find({ prodId: { $in: prodIds } }).lean();
    const byId = new Map(products.map((p) => [p.prodId, p]));
    const rollup = await ratingRollupMap(prodIds.map(String));

    const merged = agg
      .map((row) => {
        const p = byId.get(row._id);
        if (!p) return null;
        const pid = String(p.prodId);
        const { ratingAvg, reviews } = effectiveRatings(pid, p, rollup);
        return {
          prodId: p.prodId,
          slug: p.slug,
          name: p.name,
          imgSrc: p.imgSrc,
          price: p.price,
          category: p.category,
          purchases: row.purchases,
          avgRating: reviews > 0 ? ratingAvg : 0,
          reviews,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ trending: merged });
  } catch (error) {
    return NextResponse.json(
      { error: String(error), message: "Something Went Wrong" },
      { status: 400 }
    );
  }
}
