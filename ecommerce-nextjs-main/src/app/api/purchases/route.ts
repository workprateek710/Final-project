import Purchase from "@/libs/models/Purchase";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

type Line = { prodId: string; rating?: number; quantity?: number };

/**
 * Records checkout lines as purchase history.
 * Each line creates one purchase document (rating defaults to 5).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = String(body.userId ?? "anonymous").trim() || "anonymous";
    const items = body.items as Line[];
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "No items" }, { status: 400 });
    }

    await connectMongoDB();
    const docs: { userId: string; prodId: string; rating: number }[] = [];
    for (const line of items) {
      if (!line?.prodId) continue;
      const rating = Math.min(5, Math.max(1, Number(line.rating) || 5));
      const qty = Math.min(20, Math.max(1, Number(line.quantity) || 1));
      for (let i = 0; i < qty; i++) {
        docs.push({ userId, prodId: line.prodId, rating });
      }
    }
    if (docs.length === 0) {
      return NextResponse.json({ message: "No valid lines" }, { status: 400 });
    }
    await Purchase.insertMany(docs);
    return NextResponse.json({ message: "Purchases recorded", count: docs.length });
  } catch (error) {
    return NextResponse.json(
      { error: String(error), message: "Could not record purchases" },
      { status: 400 }
    );
  }
}
