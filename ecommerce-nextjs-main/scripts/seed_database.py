"""
MongoDB catalog seed for Volta Electronics (real-style product photos).

  python scripts/seed_database.py              # refresh products only (purchases/users untouched)
  python scripts/seed_database.py --demo-purchases   # also insert synthetic purchase history

Requires MONGO_URI in .env.local. Images saved under public/catalog/.
"""
from __future__ import annotations

import argparse
import os
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

try:
    from dotenv import load_dotenv
except ImportError:
    print("Install dependencies: pip install -r requirements.txt")
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
    print("Missing pymongo. Run: pip install -r requirements.txt")
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


def download_file(url: str, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    req = Request(url, headers={"User-Agent": "VoltaElectronicsSeed/1.0 (course project)"})
    with urlopen(req, timeout=120) as resp:
        target.write_bytes(resp.read())


# Wikimedia Commons — electronics / product photography (stable thumbnails).
CATALOG = [
    {
        "prodId": "elec-iphone-15",
        "slug": "apple-iphone-15-pro",
        "name": "Apple iPhone 15 Pro",
        "brand": "Apple",
        "category": "Electronics",
        "subcategory": "Phones",
        "price": "999",
        "description": "Titanium design, A17 Pro, pro camera system.",
        "file": "iphone-15-pro.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/IPhone_15_Pro_Vector.svg/800px-IPhone_15_Pro_Vector.svg.png",
        "featured": True,
    },
    {
        "prodId": "elec-galaxy-s24",
        "slug": "samsung-galaxy-s24-ultra",
        "name": "Samsung Galaxy S24 Ultra",
        "brand": "Samsung",
        "category": "Electronics",
        "subcategory": "Phones",
        "price": "1199",
        "description": "S Pen, 200MP camera, Galaxy AI.",
        "file": "galaxy-s24.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Samsung_Galaxy_S23_Ultra_Green.jpg/800px-Samsung_Galaxy_S23_Ultra_Green.jpg",
        "featured": True,
    },
    {
        "prodId": "elec-pixel-8",
        "slug": "google-pixel-8-pro",
        "name": "Google Pixel 8 Pro",
        "brand": "Google",
        "category": "Electronics",
        "subcategory": "Phones",
        "price": "899",
        "description": "Tensor G3, Magic Eraser, seven years of updates.",
        "file": "pixel-8.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Google_Pixel_8_Pro_back.jpg/800px-Google_Pixel_8_Pro_back.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-macbook-air",
        "slug": "apple-macbook-air-m3",
        "name": 'Apple MacBook Air 15" (M3)',
        "brand": "Apple",
        "category": "Electronics",
        "subcategory": "Laptops",
        "price": "1299",
        "description": "Silent fanless design, Liquid Retina, all-day battery.",
        "file": "macbook-air-m3.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/MacBook_Pro_16_inch_Space_Gray_2019.jpg/800px-MacBook_Pro_16_inch_Space_Gray_2019.jpg",
        "featured": True,
    },
    {
        "prodId": "elec-thinkpad-x1",
        "slug": "lenovo-thinkpad-x1-carbon",
        "name": "Lenovo ThinkPad X1 Carbon",
        "brand": "Lenovo",
        "category": "Electronics",
        "subcategory": "Laptops",
        "price": "1599",
        "description": "Business ultrabook, MIL-SPEC durability.",
        "file": "thinkpad-x1.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Lenovo_ThinkPad_X1_Carbon_2017_%28black%29.jpg/800px-Lenovo_ThinkPad_X1_Carbon_2017_%28black%29.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-asus-rog",
        "slug": "asus-rog-strix-g16",
        "name": "ASUS ROG Strix G16 Gaming Laptop",
        "brand": "ASUS",
        "category": "Electronics",
        "subcategory": "Laptops",
        "price": "1799",
        "description": "RTX 4070, high-refresh display, MUX switch.",
        "file": "asus-rog-g16.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Asus_ROG_Zephyrus_G14_2022.jpg/800px-Asus_ROG_Zephyrus_G14_2022.jpg",
        "featured": True,
    },
    {
        "prodId": "elec-sony-wh1000xm5",
        "slug": "sony-wh-1000xm5",
        "name": "Sony WH-1000XM5",
        "brand": "Sony",
        "category": "Electronics",
        "subcategory": "Audio",
        "price": "399",
        "description": "Industry-leading noise canceling headphones.",
        "file": "sony-wh1000xm5.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Sony_1000XM4.jpg/800px-Sony_1000XM4.jpg",
        "featured": True,
    },
    {
        "prodId": "elec-airpods-max",
        "slug": "apple-airpods-max",
        "name": "Apple AirPods Max",
        "brand": "Apple",
        "category": "Electronics",
        "subcategory": "Audio",
        "price": "549",
        "description": "Computational audio, spatial audio, stainless frame.",
        "file": "airpods-max.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/AirPods_Max_Black.jpg/800px-AirPods_Max_Black.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-bose-qc45",
        "slug": "bose-quietcomfort-45",
        "name": "Bose QuietComfort 45",
        "brand": "Bose",
        "category": "Electronics",
        "subcategory": "Audio",
        "price": "329",
        "description": "Legendary QC comfort with aware mode.",
        "file": "bose-qc45.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Bose_QuietComfort_35_II.jpg/800px-Bose_QuietComfort_35_II.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-ipad-pro",
        "slug": "apple-ipad-pro-m4",
        "name": 'Apple iPad Pro 11" (M4)',
        "brand": "Apple",
        "category": "Electronics",
        "subcategory": "Tablets",
        "price": "999",
        "description": "Ultra Retina XDR, M4 chip, pro workflows.",
        "file": "ipad-pro-m4.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/IPad_Pro_11_4th_generation_space_gray.jpg/800px-IPad_Pro_11_4th_generation_space_gray.jpg",
        "featured": True,
    },
    {
        "prodId": "elec-oled-tv",
        "slug": "lg-oled-c4-55",
        "name": 'LG OLED evo C4 55"',
        "brand": "LG",
        "category": "Electronics",
        "subcategory": "TV",
        "price": "1799",
        "description": "Perfect blacks, 120Hz gaming, Dolby Vision.",
        "file": "lg-oled-c4.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/LG_OLED_TV_2016.jpg/800px-LG_OLED_TV_2016.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-nintendo-switch",
        "slug": "nintendo-switch-oled",
        "name": "Nintendo Switch OLED",
        "brand": "Nintendo",
        "category": "Electronics",
        "subcategory": "Gaming",
        "price": "349",
        "description": '7" OLED handheld + docked play.',
        "file": "switch-oled.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Nintendo-Switch-wJoyConsBlRdStand-H.jpg/800px-Nintendo-Switch-wJoyConsBlRdStand-H.jpg",
        "featured": True,
    },
    {
        "prodId": "elec-ps5",
        "slug": "sony-playstation-5",
        "name": "Sony PlayStation 5",
        "brand": "Sony",
        "category": "Electronics",
        "subcategory": "Gaming",
        "price": "499",
        "description": "Ultra-high speed SSD, ray tracing, DualSense.",
        "file": "ps5.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/PS5_console_%28white%29.jpg/800px-PS5_console_%28white%29.jpg",
        "featured": True,
    },
    {
        "prodId": "elec-anker-charger",
        "slug": "anker-gan-prime-100w",
        "name": "Anker Prime 100W GaN Charger",
        "brand": "Anker",
        "category": "Electronics",
        "subcategory": "Accessories",
        "price": "89",
        "description": "Compact 3-port USB-C fast charging.",
        "file": "anker-gan-100w.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/USB-C_charging_cable.jpg/800px-USB-C_charging_cable.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-dell-monitor",
        "slug": "dell-ultrasharp-27-4k",
        "name": 'Dell UltraSharp 27" 4K USB-C',
        "brand": "Dell",
        "category": "Electronics",
        "subcategory": "Monitors",
        "price": "629",
        "description": "IPS Black, factory calibration, USB-C hub.",
        "file": "dell-ultrasharp-27.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Dell_U2410_monitor_-_20100709.jpg/800px-Dell_U2410_monitor_-_20100709.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-samsung-monitor",
        "slug": "samsung-odyssey-g7-32",
        "name": 'Samsung Odyssey G7 32" Curved',
        "brand": "Samsung",
        "category": "Electronics",
        "subcategory": "Monitors",
        "price": "699",
        "description": "240Hz QHD, 1000R curve, G-Sync compatible.",
        "file": "samsung-odyssey-g7.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Samsung_Curved_Monitor.jpg/800px-Samsung_Curved_Monitor.jpg",
        "featured": True,
    },
    {
        "prodId": "elec-samsung-ssd",
        "slug": "samsung-990-pro-2tb",
        "name": "Samsung 990 PRO NVMe SSD 2TB",
        "brand": "Samsung",
        "category": "Electronics",
        "subcategory": "Storage",
        "price": "179",
        "description": "PCIe 4.0 speeds for gaming and creative work.",
        "file": "samsung-990-pro.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M.2_NVMe_SSD_2280.jpg/800px-M.2_NVMe_SSD_2280.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-logitech-mx",
        "slug": "logitech-mx-master-3s",
        "name": "Logitech MX Master 3S",
        "brand": "Logitech",
        "category": "Electronics",
        "subcategory": "Accessories",
        "price": "99",
        "description": "Quiet clicks, MagSpeed scroll, multi-device.",
        "file": "logitech-mx-master.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Logitech_MX_Master_2S.jpg/800px-Logitech_MX_Master_2S.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-keychron",
        "slug": "keychron-q1-pro",
        "name": "Keychron Q1 Pro Mechanical Keyboard",
        "brand": "Keychron",
        "category": "Electronics",
        "subcategory": "Accessories",
        "price": "199",
        "description": "Wireless QMK/VIA, gasket mount, aluminum body.",
        "file": "keychron-q1.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Mechanical_keyboard_%28Unsplash%29.jpg/800px-Mechanical_keyboard_%28Unsplash%29.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-garmin",
        "slug": "garmin-fenix-7-pro",
        "name": "Garmin fēnix 7 Pro Solar",
        "brand": "Garmin",
        "category": "Electronics",
        "subcategory": "Wearables",
        "price": "799",
        "description": "Multisport GPS watch with solar charging lens.",
        "file": "garmin-fenix.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Garmin_Fenix_3_silver.jpg/800px-Garmin_Fenix_3_silver.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-nest-audio",
        "slug": "google-nest-audio",
        "name": "Google Nest Audio",
        "brand": "Google",
        "category": "Electronics",
        "subcategory": "Smart home",
        "price": "99",
        "description": "Room-filling sound, Google Assistant built in.",
        "file": "nest-audio.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Nest_Mini_%28Charcoal%29.jpg/800px-Google_Nest_Mini_%28Charcoal%29.jpg",
        "featured": False,
    },
]


def download_images() -> None:
    dest = ROOT / "public" / "catalog"
    dest.mkdir(parents=True, exist_ok=True)
    for item in CATALOG:
        target = dest / item["file"]
        if target.exists() and target.stat().st_size > 2000:
            continue
        fallback = f"https://picsum.photos/seed/{item['prodId']}/800/800"
        for label, url in (("catalog", item["url"]), ("fallback", fallback)):
            try:
                print("Downloading", item["file"], f"({label})...")
                download_file(url, target)
                if target.stat().st_size > 2000:
                    break
            except Exception as e:
                print("  WARN:", item["file"], label, e)
        else:
            print("  ERROR: could not download", item["file"])


def build_purchases() -> list[dict]:
    trending = ["elec-iphone-15", "elec-galaxy-s24", "elec-macbook-air", "elec-sony-wh1000xm5"]
    all_ids = [p["prodId"] for p in CATALOG]
    rows: list[dict] = []
    now = datetime.now(timezone.utc)

    for i in range(1, 161):
        uid = f"user_{i:03d}"
        picks = random.sample(all_ids, k=random.randint(2, 6))
        for pid in picks:
            weight = 5 if pid in trending else random.randint(3, 5)
            rows.append(
                {
                    "userId": uid,
                    "prodId": pid,
                    "rating": weight,
                    "createdAt": now - timedelta(days=random.randint(0, 120)),
                }
            )

    for pid in trending:
        for j in range(40):
            uid = f"synth_{pid}_{j}"
            rows.append(
                {
                    "userId": uid,
                    "prodId": pid,
                    "rating": 5,
                    "createdAt": now - timedelta(days=j % 60),
                }
            )

    return rows


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--demo-purchases",
        action="store_true",
        help="Insert synthetic purchase rows (otherwise purchases collection is not modified).",
    )
    args = ap.parse_args()

    download_images()
    db = get_db()
    db["products"].delete_many({})

    products = []
    for item in CATALOG:
        rel = f"/catalog/{item['file']}"
        products.append(
            {
                "prodId": item["prodId"],
                "slug": item["slug"],
                "imgSrc": rel,
                "fileKey": f"local:{rel}",
                "name": item["name"],
                "brand": item["brand"],
                "category": item["category"],
                "subcategory": item["subcategory"],
                "price": item["price"],
                "description": item["description"],
                "ratingAvg": round(4.0 + random.random() * 0.9, 2),
                "reviews": random.randint(24, 980),
                "stock": random.randint(5, 120),
                "featured": item["featured"],
            }
        )

    db["products"].insert_many(products)
    msg = f"Inserted {len(products)} products into {db.name!r}."

    if args.demo_purchases:
        db["purchases"].delete_many({})
        db["purchases"].insert_many(build_purchases())
        msg += f" Demo purchases: {db['purchases'].count_documents({})} rows."
    else:
        msg += " Purchases left unchanged (use --demo-purchases or scripts/reset_data.py as needed)."

    print(msg)


if __name__ == "__main__":
    main()
