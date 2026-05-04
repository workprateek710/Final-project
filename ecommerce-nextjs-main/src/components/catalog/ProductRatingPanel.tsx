"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  prodId: string;
  initialRatingAvg: number;
  initialReviews: number;
};

export default function ProductRatingPanel({
  prodId,
  initialRatingAvg,
  initialReviews,
}: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingAvg, setRatingAvg] = useState(initialRatingAvg);
  const [reviews, setReviews] = useState(initialReviews);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const localUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    setUserId(localUser);

    if (!localUser) return;

    axios
      .get("/api/ratings", { params: { prodId, userId: localUser } })
      .then((res) => {
        const data = res.data ?? {};
        if (typeof data.userRating === "number") {
          setUserRating(data.userRating);
        }
        if (data.hasRatings && typeof data.ratingAvg === "number") {
          setRatingAvg(data.ratingAvg);
          setReviews(Number(data.reviews) || 0);
        }
      })
      .catch(() => {
        // Non-blocking read; page still renders with initial values.
      });
  }, [prodId]);

  const roundedStars = useMemo(() => Math.round(ratingAvg), [ratingAvg]);

  const submitRating = async (stars: number) => {
    if (!userId) {
      toast.error("Please log in to rate products.");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post("/api/ratings", {
        prodId,
        userId,
        rating: stars,
      });
      setUserRating(stars);
      if (typeof res.data?.ratingAvg === "number") {
        setRatingAvg(res.data.ratingAvg);
      }
      if (typeof res.data?.reviews === "number") {
        setReviews(res.data.reviews);
      }
      toast.success("Rating saved");
    } catch {
      toast.error("Could not save rating");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="flex items-center gap-2">
        <div className="flex text-amber-400 text-base">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < roundedStars ? "opacity-100" : "opacity-25"}>
              ★
            </span>
          ))}
        </div>
        <span className="text-slate-700 text-sm font-medium">
          {ratingAvg.toFixed(1)} · {reviews} {reviews === 1 ? "review" : "reviews"}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Rate this product
        </p>
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const star = i + 1;
            const active = (userRating ?? 0) >= star;
            return (
              <button
                key={star}
                type="button"
                disabled={saving}
                onClick={() => submitRating(star)}
                className={`text-xl leading-none transition ${
                  active ? "text-amber-400" : "text-slate-300 hover:text-amber-300"
                } ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                title={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                ★
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {userId
            ? userRating
              ? `Your rating: ${userRating}/5 (click a star to update)`
              : "Click a star to submit your rating"
            : "Log in to submit a rating"}
        </p>
      </div>
    </div>
  );
}
