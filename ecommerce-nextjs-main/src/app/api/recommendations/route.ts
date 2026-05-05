import { NextRequest, NextResponse } from "next/server";
import Purchase from "@/libs/models/Purchase";
import Product from "@/libs/models/Product";
import { connectMongoDB } from "@/libs/MongoConnect";
import { buildTfIdfVectors, cosineSimilarity } from "@/utils/recommendationScoring";

const MIN_PURCHASES_FOR_RECS = Math.max(
  1,
  Number(process.env.MIN_PURCHASES_FOR_RECS ?? "1")
);
const RECENT_PURCHASE_CONTEXT = 20;

type ProductDoc = {
  prodId: string;
  slug: string;
  name: string;
  imgSrc: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  description?: string;
  price?: string | number;
  ratingAvg?: number;
  reviews?: number;
};

type PurchaseDoc = {
  prodId: string;
  rating?: number;
  createdAt?: Date;
};

type ActivityRow = { _id: string; purchases: number };

/**
 * Content-based recommender:
 * - Builds TF-IDF vectors from product metadata.
 * - Uses each user's most recent purchases as weighted query items.
 * - Ranks by cosine similarity, then activity signals.
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user_id");
  const limit = Math.min(
    60,
    Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? "5"))
  );
  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }
  try {
    await connectMongoDB();

    const [userPurchases, products, activityRows] = await Promise.all([
      Purchase.find({ userId }).sort({ createdAt: -1 }).lean<PurchaseDoc[]>(),
      Product.find({ category: "Electronics" })
        .select(
          "prodId slug name imgSrc category subcategory brand description price ratingAvg reviews"
        )
        .lean<ProductDoc[]>(),
      Purchase.aggregate<ActivityRow>([
        { $group: { _id: "$prodId", purchases: { $sum: 1 } } },
      ]),
    ]);

    if (userPurchases.length < MIN_PURCHASES_FOR_RECS) {
      return NextResponse.json({
        recommendations: [],
        reason: "insufficient_history",
        purchaseCount: userPurchases.length,
      });
    }

    const activityByProdId = new Map(
      activityRows.map((row) => [row._id, row.purchases])
    );
    const productIndex = new Map(products.map((product, index) => [product.prodId, index]));
    const vectors = buildTfIdfVectors(products);
    const purchased = new Set(userPurchases.map((purchase) => purchase.prodId));
    const recentPurchases = userPurchases.slice(0, RECENT_PURCHASE_CONTEXT);
    const scores = new Map<string, number>();

    recentPurchases.forEach((purchase, purchaseIndex) => {
      const sourceIndex = productIndex.get(purchase.prodId);
      if (sourceIndex === undefined) return;

      const recencyWeight = 1 / (1 + purchaseIndex * 0.15);
      const ratingWeight = Math.max(1, Number(purchase.rating ?? 5)) / 5;
      const sourceVector = vectors[sourceIndex];

      products.forEach((candidate, candidateIndex) => {
        if (purchased.has(candidate.prodId)) return;

        const similarity = cosineSimilarity(sourceVector, vectors[candidateIndex]);
        if (similarity <= 0) return;

        const weightedScore = similarity * recencyWeight * ratingWeight;
        scores.set(candidate.prodId, (scores.get(candidate.prodId) ?? 0) + weightedScore);
      });
    });

    const ranked = products
      .filter((product) => !purchased.has(product.prodId))
      .map((product) => ({
        product,
        score: scores.get(product.prodId) ?? 0,
        purchases: activityByProdId.get(product.prodId) ?? 0,
        reviews: Number(product.reviews ?? 0),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.purchases !== a.purchases) return b.purchases - a.purchases;
        return b.reviews - a.reviews;
      })
      .slice(0, limit);

    const recommendations = ranked.map(({ product, score, purchases, reviews }) => ({
      prod_id: product.prodId,
      rating: Number(score.toFixed(4)),
      name: product.name,
      price: String(product.price ?? ""),
      imgSrc: product.imgSrc,
      slug: product.slug,
      ratingAvg: Number(product.ratingAvg ?? 0),
      reviews,
      purchases,
      subcategory: product.subcategory ?? "General",
    }));

    return NextResponse.json({
      user_id: userId,
      purchaseCount: userPurchases.length,
      recommendationBasis: recentPurchases.map((purchase) => ({
        prodId: purchase.prodId,
        rating: purchase.rating,
        createdAt: purchase.createdAt,
      })),
      recommendations,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Recommendations unavailable", detail: String(error), recommendations: [] },
      { status: 503 }
    );
  }
}
