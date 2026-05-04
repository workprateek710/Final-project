"""
Assign subcategories to existing Electronics products.

Usage:
  python scripts/recategorize_electronics.py
"""

from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
from pymongo import MongoClient

ROOT = Path(__file__).resolve().parents[1]


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for encoding in ("utf-8-sig", "utf-16-le", "utf-8", "utf-16"):
        try:
            load_dotenv(path, encoding=encoding)
            return
        except UnicodeDecodeError:
            continue
        except ValueError as error:
            if "null" in str(error).lower():
                continue
            raise


_load_env_file(ROOT / ".env.local")
_load_env_file(ROOT / ".env")


def guess_subcategory(name: str) -> str:
    lower = name.lower()
    rules = [
        ("Phones", ["iphone", "pixel", "galaxy s", "oneplus", "phone", "xiaomi", "motorola"]),
        ("Laptops", ["laptop", "macbook", "thinkpad", "xps", "surface laptop", "gram"]),
        ("Tablets", ["ipad", "tablet", "tab "]),
        (
            "Audio",
            ["airpods", "headphone", "earbud", "speaker", "microphone", "bose", "sony wh"],
        ),
        ("TV", ["tv", "oled", "bravia"]),
        (
            "Gaming",
            ["playstation", "xbox", "switch", "controller", "steam deck", "quest", "g923"],
        ),
        (
            "Accessories",
            ["charger", "hub", "keyboard", "mouse", "backpack", "power bank", "magsafe"],
        ),
        ("Monitors", ["monitor", "ultrasharp", "odyssey", "ultragear"]),
        ("Storage", ["ssd", "nvme", "hard drive", "t7", "sn850", "ironwolf", "kc3000"]),
        ("Cameras", ["camera", "canon", "sony alpha", "gopro", "lumix", "nikon", "fujifilm"]),
        ("Wearables", ["watch", "fitbit", "whoop", "ring", "fenix", "suunto", "polar"]),
        ("Smart home", ["nest", "echo", "doorbell", "thermostat", "hue", "smart"]),
        ("Desktops", ["desktop", "imac"]),
        ("Printers", ["printer", "laserjet"]),
        ("Networking", ["router", "wi-fi", "wifi", "network"]),
        ("Drones", ["drone", "dji mini", "evo lite"]),
    ]
    for subcategory, keywords in rules:
        if any(keyword in lower for keyword in keywords):
            return subcategory
    return "General"


def get_db():
    mongo_uri = os.environ.get("MONGO_URI", "").strip() or os.environ.get("MONGODB_URI", "").strip()
    if not mongo_uri:
        raise RuntimeError("Set MONGO_URI (or MONGODB_URI) in .env.local")
    client = MongoClient(mongo_uri)
    parsed_path = (urlparse(mongo_uri).path or "").strip("/")
    name = parsed_path.split("/")[0] if parsed_path else None
    return client[name] if name else client.get_database()


def main() -> None:
    db = get_db()
    products = db["products"]
    query = {
        "category": "Electronics",
        "$or": [{"subcategory": {"$exists": False}}, {"subcategory": ""}, {"subcategory": "General"}],
    }
    docs = list(products.find(query, {"_id": 1, "name": 1, "subcategory": 1}))
    updates = 0
    for doc in docs:
        subcategory = guess_subcategory(doc.get("name", ""))
        result = products.update_one({"_id": doc["_id"]}, {"$set": {"subcategory": subcategory}})
        updates += int(result.modified_count)
    print(f"Reviewed {len(docs)} product(s); updated {updates} product(s).")


if __name__ == "__main__":
    main()
