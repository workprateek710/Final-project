import { NextRequest, NextResponse } from "next/server";

const FLASK_BASE =
  process.env.FLASK_RECOMMENDER_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";

/**
 * Server-side proxy to the Flask recommender so the browser never hard-codes the port.
 * Flask returns prod_ids; it already merges Mongo product fields when configured.
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }
  try {
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
      { error: "Recommender unavailable", recommendations: [] },
      { status: 503 }
    );
  }
}
