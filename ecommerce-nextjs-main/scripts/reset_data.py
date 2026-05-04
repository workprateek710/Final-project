"""
Clear storefront purchase history and registered users (MongoDB).
Products are left untouched — run seed_database.py to refresh catalog.

Usage (from ecommerce-nextjs-main):
  python scripts/reset_data.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from urllib.parse import urlparse

try:
    from dotenv import load_dotenv
except ImportError:
    print("Install: pip install -r requirements.txt")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for enc in ("utf-8-sig", "utf-8", "utf-16"):
        try:
            load_dotenv(path, encoding=enc)
            return
        except (UnicodeDecodeError, UnicodeError):
            continue


_load_env_file(ROOT / ".env.local")
_load_env_file(ROOT / ".env")

try:
    from pymongo import MongoClient
except ImportError:
    print("Missing pymongo.")
    sys.exit(1)

MONGO_URI = os.environ.get("MONGO_URI", "").strip()
if not MONGO_URI:
    print("Set MONGO_URI in .env.local (e.g. mongodb://127.0.0.1:27017/ecommerce-597)")
    sys.exit(1)


def get_db():
    client = MongoClient(MONGO_URI)
    path = (urlparse(MONGO_URI).path or "").strip("/")
    name = path.split("/")[0] if path else None
    return client[name] if name else client.get_database()


def main():
    db = get_db()
    pr = db["purchases"].delete_many({})
    ur = db["users"].delete_many({})
    print(f"Deleted {pr.deleted_count} purchase rows and {ur.deleted_count} users in database {db.name!r}.")
    print("Open MongoDB Compass: use the same MONGO_URI and browse collections purchases, users.")


if __name__ == "__main__":
    main()
