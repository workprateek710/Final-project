import ProductRating from "@/libs/models/ProductRating";

export type RatingRollupRow = { ratingAvg: number; reviews: number };

/** Live aggregates from productratings (handles drift vs denormalized Product fields). */
export async function ratingRollupMap(prodIds: string[]): Promise<Map<string, RatingRollupRow>> {
  const uniq = [...new Set(prodIds.filter(Boolean))];
  if (!uniq.length) return new Map();
  const rows = await ProductRating.aggregate<{ _id: string; ratingAvg: number; reviews: number }>([
    { $match: { prodId: { $in: uniq } } },
    {
      $group: {
        _id: "$prodId",
        reviews: { $sum: 1 },
        ratingAvg: { $avg: "$rating" },
      },
    },
  ]);
  const m = new Map<string, RatingRollupRow>();
  for (const r of rows) {
    const pid = String(r._id);
    m.set(pid, {
      reviews: r.reviews,
      ratingAvg: Number(Number(r.ratingAvg).toFixed(2)),
    });
  }
  return m;
}

export function effectiveRatings(
  prodId: string,
  doc: { ratingAvg?: number; reviews?: number },
  rollup: Map<string, RatingRollupRow>
): { ratingAvg: number; reviews: number } {
  const live = rollup.get(prodId);
  if (live && live.reviews > 0) return live;
  return {
    reviews: Number(doc.reviews ?? 0),
    ratingAvg: Number(doc.ratingAvg ?? 0),
  };
}
