import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/libs/MongoConnect";
import ProductRating from "@/libs/models/ProductRating";
import Product from "@/libs/models/Product";
import Purchase from "@/libs/models/Purchase";

type AggregateRow = { _id: string; avg: number; count: number };

async function getAggregateForProduct(prodId: string) {
  const rows = (await ProductRating.aggregate([
    { $match: { prodId } },
    {
      $group: {
        _id: "$prodId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ])) as AggregateRow[];

  if (!rows.length) {
    return { hasRatings: false, ratingAvg: null, reviews: 0 };
  }

  return {
    hasRatings: true,
    ratingAvg: Number(rows[0].avg.toFixed(2)),
    reviews: rows[0].count,
  };
}

export async function GET(request: NextRequest) {
  try {
    const prodId = request.nextUrl.searchParams.get("prodId");
    const userId = request.nextUrl.searchParams.get("userId");
    if (!prodId) {
      return NextResponse.json({ message: "prodId is required" }, { status: 400 });
    }

    await connectMongoDB();
    const summary = await getAggregateForProduct(prodId);
    let userRating: number | null = null;

    if (userId) {
      const doc = await ProductRating.findOne({ prodId, userId }).lean();
      userRating = doc?.rating ?? null;
    }

    return NextResponse.json({ ...summary, userRating });
  } catch (error) {
    return NextResponse.json(
      { message: "Could not fetch ratings", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prodId = String(body.prodId ?? "").trim();
    const userId = String(body.userId ?? "").trim();
    const ratingNum = Number(body.rating);

    if (!prodId || !userId) {
      return NextResponse.json(
        { message: "prodId and userId are required" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { message: "rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    await connectMongoDB();
    await ProductRating.findOneAndUpdate(
      { prodId, userId },
      { rating: Math.round(ratingNum) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await Purchase.updateMany({ prodId, userId }, { rating: Math.round(ratingNum) });

    const summary = await getAggregateForProduct(prodId);
    if (summary.hasRatings && summary.ratingAvg !== null) {
      await Product.findOneAndUpdate(
        { prodId },
        { ratingAvg: summary.ratingAvg, reviews: summary.reviews }
      );
    }

    return NextResponse.json({
      message: "Rating saved",
      ratingAvg: summary.ratingAvg,
      reviews: summary.reviews,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Could not save rating", error: String(error) },
      { status: 500 }
    );
  }
}
