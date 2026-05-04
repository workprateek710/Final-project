import { NextRequest, NextResponse } from "next/server";
import Purchase from "@/libs/models/Purchase";
import { connectMongoDB } from "@/libs/MongoConnect";

const FLASK_BASE =
  process.env.FLASK_RECOMMENDER_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";
const MIN_PURCHASES_FOR_RECS = Math.max(
  1,
  Number(process.env.MIN_PURCHASES_FOR_RECS ?? "1")
);

/**
 * Server-side proxy to the personalization service.
 * Keeps service URLs private and centralizes gating rules.
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }
  try {
    // Gate recommendations until user has enough purchase history.
    await connectMongoDB();
    const purchaseCount = await Purchase.countDocuments({ userId });
    if (purchaseCount < MIN_PURCHASES_FOR_RECS) {
      return NextResponse.json({
        recommendations: [],
        reason: "insufficient_history",
        purchaseCount,
      });
    }

    const res = await fetch(
      `${FLASK_BASE}/recommend?user_id=${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Recommendations unavailable", recommendations: [] },
      { status: 503 }
    );
  }
}
