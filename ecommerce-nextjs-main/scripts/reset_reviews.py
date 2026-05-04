"""
Reset all product review aggregates and clear per-user product ratings.

Usage:
  python scripts/reset_reviews.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from urllib.parse import urlparse

try:
    from dotenv import load_dotenv
    from pymongo import MongoClient
except ImportError:
    print("Install dependencies first: pip install -r requirements.txt")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for enc in ("utf-8-sig", "utf-16-le", "utf-8", "utf-16"):
        try:
            load_dotenv(path, encoding=enc)
            return
        except UnicodeDecodeError:
            continue
        except ValueError as e:
            if "null" in str(e).lower():
                continue
            raise


def get_db():
    _load_env_file(ROOT / ".env.local")
    _load_env_file(ROOT / ".env")
    uri = os.environ.get("MONGO_URI", "").strip()
    if not uri:
        print("MONGO_URI not found in .env.local / .env")
        sys.exit(1)
    client = MongoClient(uri)
    path = (urlparse(uri).path or "").strip("/")
    name = path.split("/")[0] if path else None
    return client[name] if name else client.get_database()


def main() -> None:
    db = get_db()
    products = db["products"].update_many({}, {"$set": {"ratingAvg": 0, "reviews": 0}})
    ratings = db["productratings"].delete_many({})
    print(
        f"DB={db.name!r} products_reset={products.modified_count} ratings_deleted={ratings.deleted_count}"
    )


if __name__ == "__main__":
    main()
