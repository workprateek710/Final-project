import { NextRequest, NextResponse } from "next/server";
import Purchase from "@/libs/models/Purchase";
import Product from "@/libs/models/Product";
import { connectMongoDB } from "@/libs/MongoConnect";

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

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function productText(product: ProductDoc) {
  return [
    product.name,
    product.category,
    product.subcategory,
    product.brand,
    product.description,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildTfIdfVectors(products: ProductDoc[]) {
  const documents = products.map((product) => tokenize(productText(product)));
  const docFreq = new Map<string, number>();

  for (const tokens of documents) {
    for (const token of new Set(tokens)) {
      docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
    }
  }

  const totalDocs = Math.max(1, documents.length);
  return documents.map((tokens) => {
    const counts = new Map<string, number>();
    for (const token of tokens) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }

    const vector = new Map<string, number>();
    for (const [token, count] of counts) {
      const tf = count / Math.max(1, tokens.length);
      const idf = Math.log((1 + totalDocs) / (1 + (docFreq.get(token) ?? 0))) + 1;
      vector.set(token, tf * idf);
    }
    return vector;
  });
}

function cosine(a: Map<string, number>, b: Map<string, number>) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const value of a.values()) normA += value * value;
  for (const value of b.values()) normB += value * value;
  for (const [token, value] of a) {
    dot += value * (b.get(token) ?? 0);
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

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

        const similarity = cosine(sourceVector, vectors[candidateIndex]);
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
