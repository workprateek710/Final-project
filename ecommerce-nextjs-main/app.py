from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import svds
import os
from urllib.parse import urlparse

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


# Load your dataset and preprocess
df = load_interactions_dataframe()
df = df.groupby(["user_id", "prod_id"], as_index=False).agg({"rating": "mean"})

# Preprocess data: Filter users with sufficient ratings
counts = df["user_id"].value_counts()
df_final = df[df["user_id"].isin(counts[counts >= 1].index)]

# Create ratings matrix (users as rows, products as columns)
final_ratings_matrix = df_final.pivot(index="user_id", columns="prod_id", values="rating").fillna(0)

# SVD requires 0 < k < min(rows, cols). With very few purchases (or 1xN / Nx1), skip SVD and use zeros — recommend_items still falls back to popularity.
n_rows, n_cols = final_ratings_matrix.shape
min_dim = min(n_rows, n_cols) if n_rows and n_cols else 0
if min_dim < 2:
    predicted_ratings = np.zeros((n_rows, n_cols), dtype=float)
else:
    final_ratings_matrix_sparse = csr_matrix(final_ratings_matrix.values)
    k_value = min(50, min_dim - 1)
    if k_value < 1:
        predicted_ratings = np.zeros((n_rows, n_cols), dtype=float)
    else:
        U, sigma, Vt = svds(final_ratings_matrix_sparse, k=k_value)
        sigma = np.diag(sigma)
        predicted_ratings = np.dot(np.dot(U, sigma), Vt)

predicted_ratings_df = pd.DataFrame(
    predicted_ratings,
    index=final_ratings_matrix.index,
    columns=final_ratings_matrix.columns,
)


# Recommendation function: Returns top N recommended products for a user
def recommend_items(user_id, top_n=5):
    if user_id not in predicted_ratings_df.index:
        # If the user is not in the predicted ratings matrix, return top N popular items based on average rating
        popular_items = df.groupby("prod_id").agg({"rating": "mean"}).sort_values(by="rating", ascending=False).head(top_n)
        return popular_items.index.tolist()

    user_index = list(final_ratings_matrix.index).index(user_id)
    user_predicted_ratings = predicted_ratings_df.iloc[user_index].sort_values(ascending=False)

    # Return top N recommended products
    recommended_products = user_predicted_ratings.head(top_n).index.tolist()
    return recommended_products


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

        # Baseline join from interaction history (name may be missing for cold pool)
        recommended_products = df[df["prod_id"].isin(recommendations)].drop_duplicates(subset="prod_id")
        product_details = recommended_products[["prod_id", "rating"]].to_dict(orient="records")

        # Merge Mongo catalog fields for UI (does not change recommendation logic)
        mongo_rows = _products_by_prod_ids(recommendations)
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
