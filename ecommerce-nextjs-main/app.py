from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
from urllib.parse import urlparse
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# --- Optional: load .env next to this file (same vars as Next.js / seed script) ---
try:
    from dotenv import load_dotenv

    def _load_env_files():
        base = os.path.dirname(__file__)
        for name in (".env.local", ".env"):
            p = os.path.join(base, name)
            if not os.path.isfile(p):
                continue
            for enc in ("utf-8-sig", "utf-8", "utf-16"):
                try:
                    load_dotenv(p, encoding=enc)
                    break
                except (UnicodeDecodeError, UnicodeError):
                    continue

    _load_env_files()
except ImportError:
    pass

try:
    from pymongo import MongoClient
except ImportError:
    MongoClient = None  # type: ignore

# Initialize Flask App
app = Flask(__name__)
CORS(app)


def _mongo_db():
    """Resolve pymongo database from MONGO_URI (same URI as Mongoose)."""
    if MongoClient is None:
        return None
    uri = os.environ.get("MONGO_URI", "").strip()
    if not uri:
        return None
    client = MongoClient(uri)
    path = (urlparse(uri).path or "").strip("/")
    db_name = path.split("/")[0] if path else None
    if not db_name:
        return client.get_database()
    return client[db_name]


def load_interactions_dataframe():
    """
    Build the same ratings table the original CSV pipeline produced:
    columns user_id, prod_id, rating (strings for ids).

    Primary source: MongoDB `purchases` collection (written by Next checkout).
    Fallback: bundled CSV for offline demos.
    """
    db = _mongo_db()
    if db is not None:
        cur = db["purchases"].find({}, {"userId": 1, "prodId": 1, "rating": 1, "_id": 0})
        rows = list(cur)
        if rows:
            df = pd.DataFrame(rows)
            df = df.drop(columns=["_id"], errors="ignore")
            df = df.rename(columns={"userId": "user_id", "prodId": "prod_id"})
            df["user_id"] = df["user_id"].astype(str)
            df["prod_id"] = df["prod_id"].astype(str)
            df["rating"] = pd.to_numeric(df["rating"], errors="coerce").fillna(5.0)
            return df

    csv_path = os.path.join(os.path.dirname(__file__), "ecommerce_sample_1700_rows.csv")
    df = pd.read_csv(csv_path)
    df.columns = ["user_id", "prod_id", "rating", "price"]
    df = df.drop(columns=["price"])
    df["user_id"] = df["user_id"].astype(str)
    df["prod_id"] = df["prod_id"].astype(str)
    return df


def load_products_dataframe():
    """
    Load catalog metadata used for TF-IDF item similarity.
    """
    db = _mongo_db()
    if db is None:
        return pd.DataFrame(
            columns=[
                "prod_id",
                "name",
                "category",
                "subcategory",
                "brand",
                "description",
                "rating_avg",
            ]
        )
    rows = list(
        db["products"].find(
            {},
            {
                "_id": 0,
                "prodId": 1,
                "name": 1,
                "category": 1,
                "subcategory": 1,
                "brand": 1,
                "description": 1,
                "ratingAvg": 1,
            },
        )
    )
    if not rows:
        return pd.DataFrame(
            columns=[
                "prod_id",
                "name",
                "category",
                "subcategory",
                "brand",
                "description",
                "rating_avg",
            ]
        )
    pdf = pd.DataFrame(rows).rename(columns={"prodId": "prod_id", "ratingAvg": "rating_avg"})
    pdf["prod_id"] = pdf["prod_id"].astype(str)
    for col in ("name", "category", "subcategory", "brand", "description"):
        pdf[col] = pdf[col].fillna("").astype(str)
    pdf["rating_avg"] = pd.to_numeric(pdf.get("rating_avg", 0), errors="coerce").fillna(0)
    return pdf


def build_recommender_artifacts():
    interactions = load_interactions_dataframe()
    interactions = interactions.groupby(["user_id", "prod_id"], as_index=False).agg({"rating": "mean"})

    popularity = (
        interactions.groupby("prod_id")
        .agg(purchases=("rating", "count"), avg_rating=("rating", "mean"))
        .sort_values(by=["purchases", "avg_rating"], ascending=[False, False])
    )

    products = load_products_dataframe()
    if products.empty:
        return {
            "interactions": interactions,
            "popularity": popularity,
            "products": products,
            "prod_ids": [],
            "prod_to_idx": {},
            "cosine": np.zeros((0, 0), dtype=float),
        }

    products = products.drop_duplicates(subset="prod_id").reset_index(drop=True)
    corpus = (
        products["name"]
        + " "
        + products["category"]
        + " "
        + products["subcategory"]
        + " "
        + products["brand"]
        + " "
        + products["description"]
    ).str.lower()

    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(corpus)
    cosine = cosine_similarity(tfidf_matrix, dense_output=False)

    prod_ids = products["prod_id"].tolist()
    prod_to_idx = {pid: i for i, pid in enumerate(prod_ids)}
    return {
        "interactions": interactions,
        "popularity": popularity,
        "products": products,
        "prod_ids": prod_ids,
        "prod_to_idx": prod_to_idx,
        "cosine": cosine,
    }


def _popular_items(popularity_df, top_n=5, exclude=None):
    exclude = exclude or set()
    ids = [pid for pid in popularity_df.index.tolist() if pid not in exclude]
    return ids[:top_n]


def recommend_items(user_id, top_n=5):
    """
    Personalized recommendations using TF-IDF + cosine item similarity.
    If user has no history, fallback to popular items.
    """
    artifacts = build_recommender_artifacts()
    interactions = artifacts["interactions"]
    popularity = artifacts["popularity"]
    prod_ids = artifacts["prod_ids"]
    prod_to_idx = artifacts["prod_to_idx"]
    cosine = artifacts["cosine"]

    user_rows = interactions[interactions["user_id"] == str(user_id)]
    if user_rows.empty:
        fallback_ids = _popular_items(popularity, top_n=top_n)
        return [(pid, float(popularity.loc[pid, "avg_rating"])) for pid in fallback_ids]

    purchased = set(user_rows["prod_id"].astype(str).tolist())
    scores = {}

    for _, row in user_rows.iterrows():
        pid = str(row["prod_id"])
        if pid not in prod_to_idx:
            continue
        item_idx = prod_to_idx[pid]
        rating_weight = float(row["rating"])
        sim_row = cosine.getrow(item_idx)
        for neighbor_idx, sim in zip(sim_row.indices, sim_row.data):
            candidate_pid = prod_ids[int(neighbor_idx)]
            if candidate_pid in purchased:
                continue
            weighted = float(sim) * rating_weight
            if weighted <= 0:
                continue
            scores[candidate_pid] = scores.get(candidate_pid, 0.0) + weighted

    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    chosen = ranked[:top_n]
    chosen_ids = {pid for pid, _ in chosen}

    if len(chosen) < top_n:
        needed = top_n - len(chosen)
        fill_ids = _popular_items(popularity, top_n=needed + len(chosen_ids), exclude=purchased | chosen_ids)
        for pid in fill_ids:
            if pid in chosen_ids:
                continue
            base = float(popularity.loc[pid, "avg_rating"]) if pid in popularity.index else 0.0
            chosen.append((pid, base))
            chosen_ids.add(pid)
            if len(chosen) >= top_n:
                break
    return chosen


def _products_by_prod_ids(prod_ids):
    """Hydrate recommender output with storefront fields from Mongo `products`."""
    db = _mongo_db()
    if db is None or not prod_ids:
        return []
    docs = list(
        db["products"].find(
            {"prodId": {"$in": list(prod_ids)}},
            {"prodId": 1, "name": 1, "price": 1, "imgSrc": 1, "slug": 1, "ratingAvg": 1},
        )
    )
    return docs


# Root route
@app.route("/")
def index():
    return "Flask API is running!"


# API Endpoint for Recommendations
@app.route("/recommend", methods=["GET"])
def recommend():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        recommendations = recommend_items(user_id)
        product_details = [{"prod_id": pid, "rating": score} for pid, score in recommendations]

        # Merge Mongo catalog fields for UI (does not change recommendation logic)
        mongo_rows = _products_by_prod_ids([pid for pid, _ in recommendations])
        by_pid = {row["prodId"]: row for row in mongo_rows}
        for row in product_details:
            pid = row["prod_id"]
            m = by_pid.get(pid)
            if m:
                row["name"] = m.get("name", "")
                row["price"] = m.get("price", "")
                row["imgSrc"] = m.get("imgSrc", "")
                row["slug"] = m.get("slug", "")
                row["ratingAvg"] = m.get("ratingAvg", row.get("rating"))

        return jsonify({"user_id": user_id, "recommendations": product_details})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
