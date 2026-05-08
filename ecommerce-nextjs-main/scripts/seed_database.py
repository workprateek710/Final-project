"""
MongoDB catalog seed for Volta Electronics (real-style product photos).

  python scripts/seed_database.py
      Refresh products from CATALOG (+101 expansion SKUs). Purchases/ratings unchanged unless flags below.

  python scripts/seed_database.py --demo-purchases
      Also replace purchases with the older short synthetic demo.

  python scripts/seed_database.py --rich-demo
      Replace purchases + productratings with dense demo: ~280 synthetic users averaging ~17 purchases each,
      sparse ratings (about 28% of purchased pairs), then sync products.ratingAvg/reviews.

  python scripts/seed_database.py --skip-image-download
      Skip downloading files into public/catalog (Mongo imgSrc uses Wikimedia HTTPS URLs — best for Vercel).

Requires MONGO_URI in .env.local.
Warning: Re-seeding calls products.delete_many({}) — take an Atlas backup first if needed.
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
_SCRIPTS_DIR = Path(__file__).resolve().parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from seed_expansion_101 import expansion_hundred_one  # noqa: E402


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return
    # Windows editors often save .env as UTF-16-LE; try that before UTF-8.
    for enc in ("utf-8-sig", "utf-16-le", "utf-8", "utf-16"):
        try:
            load_dotenv(path, encoding=enc)
            return
        except UnicodeDecodeError:
            continue
        except ValueError as e:
            # UTF-8 can "decode" UTF-16 .env files but inject NULs into keys; try next encoding.
            if "null" in str(e).lower():
                continue
            raise


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
    # ── Cameras ──────────────────────────────────────────────────────────────
    {
        "prodId": "elec-sony-a7iv",
        "slug": "sony-alpha-7-iv",
        "name": "Sony Alpha 7 IV",
        "brand": "Sony",
        "category": "Electronics",
        "subcategory": "Cameras",
        "price": "2499",
        "description": "33MP full-frame, 4K60 video, real-time eye-AF.",
        "file": "sony-a7iv.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Sony_Alpha_7R_IV_01.jpg/800px-Sony_Alpha_7R_IV_01.jpg",
        "featured": True,
    },
    {
        "prodId": "elec-canon-r50",
        "slug": "canon-eos-r50",
        "name": "Canon EOS R50",
        "brand": "Canon",
        "category": "Electronics",
        "subcategory": "Cameras",
        "price": "679",
        "description": "24MP APS-C mirrorless, 4K video, great for beginners.",
        "file": "canon-r50.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Canon_EOS_M50.jpg/800px-Canon_EOS_M50.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-gopro-hero12",
        "slug": "gopro-hero-12-black",
        "name": "GoPro HERO 12 Black",
        "brand": "GoPro",
        "category": "Electronics",
        "subcategory": "Cameras",
        "price": "399",
        "description": "5.3K60 action camera, HyperSmooth 6.0, waterproof.",
        "file": "gopro-hero12.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/GoPro_Hero10.jpg/800px-GoPro_Hero10.jpg",
        "featured": False,
    },
    # ── Smart Home ───────────────────────────────────────────────────────────
    {
        "prodId": "elec-echo-dot5",
        "slug": "amazon-echo-dot-5th-gen",
        "name": "Amazon Echo Dot (5th Gen)",
        "brand": "Amazon",
        "category": "Electronics",
        "subcategory": "Smart home",
        "price": "49",
        "description": "Improved bass, Eero built-in, motion sensor.",
        "file": "echo-dot-5.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Amazon_Echo_Dot_2nd_Generation.jpg/800px-Amazon_Echo_Dot_2nd_Generation.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-ring-doorbell4",
        "slug": "ring-video-doorbell-4",
        "name": "Ring Video Doorbell 4",
        "brand": "Ring",
        "category": "Electronics",
        "subcategory": "Smart home",
        "price": "219",
        "description": "1080p HDR, pre-roll video, color night vision.",
        "file": "ring-doorbell4.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Ring_Video_Doorbell_Pro_2.jpg/800px-Ring_Video_Doorbell_Pro_2.jpg",
        "featured": False,
    },
    # ── Wearables ────────────────────────────────────────────────────────────
    {
        "prodId": "elec-apple-watch-ultra2",
        "slug": "apple-watch-ultra-2",
        "name": "Apple Watch Ultra 2",
        "brand": "Apple",
        "category": "Electronics",
        "subcategory": "Wearables",
        "price": "799",
        "description": "Titanium case, dual-frequency GPS, 60-hour battery.",
        "file": "apple-watch-ultra2.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Apple_Watch_Series_7_product_page.jpg/800px-Apple_Watch_Series_7_product_page.jpg",
        "featured": True,
    },
    {
        "prodId": "elec-galaxy-watch6",
        "slug": "samsung-galaxy-watch-6-classic",
        "name": "Samsung Galaxy Watch 6 Classic",
        "brand": "Samsung",
        "category": "Electronics",
        "subcategory": "Wearables",
        "price": "399",
        "description": "Rotating bezel, 3-in-1 health sensor, Wear OS.",
        "file": "galaxy-watch6.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Samsung_Galaxy_Watch_4.jpg/800px-Samsung_Galaxy_Watch_4.jpg",
        "featured": False,
    },
    # ── Gaming ───────────────────────────────────────────────────────────────
    {
        "prodId": "elec-xbox-series-x",
        "slug": "microsoft-xbox-series-x",
        "name": "Microsoft Xbox Series X",
        "brand": "Microsoft",
        "category": "Electronics",
        "subcategory": "Gaming",
        "price": "499",
        "description": "4K gaming, 12 TFLOPS, Quick Resume, Game Pass.",
        "file": "xbox-series-x.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Xbox_Series_X_-_1_%28cropped%29.jpg/800px-Xbox_Series_X_-_1_%28cropped%29.jpg",
        "featured": True,
    },
    {
        "prodId": "elec-steam-deck",
        "slug": "valve-steam-deck-oled",
        "name": "Valve Steam Deck OLED",
        "brand": "Valve",
        "category": "Electronics",
        "subcategory": "Gaming",
        "price": "549",
        "description": "7.4\" OLED display, 90Hz, 50Wh battery, handheld PC.",
        "file": "steam-deck-oled.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Steam_Deck_-_Front_View.jpg/800px-Steam_Deck_-_Front_View.jpg",
        "featured": True,
    },
    # ── Tablets ──────────────────────────────────────────────────────────────
    {
        "prodId": "elec-galaxy-tab-s9",
        "slug": "samsung-galaxy-tab-s9-ultra",
        "name": 'Samsung Galaxy Tab S9 Ultra',
        "brand": "Samsung",
        "category": "Electronics",
        "subcategory": "Tablets",
        "price": "1199",
        "description": "14.6\" Dynamic AMOLED 2X, S Pen included, DeX mode.",
        "file": "galaxy-tab-s9.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Samsung_Galaxy_Tab_S8_Ultra.jpg/800px-Samsung_Galaxy_Tab_S8_Ultra.jpg",
        "featured": False,
    },
    # ── Laptops ──────────────────────────────────────────────────────────────
    {
        "prodId": "elec-dell-xps15",
        "slug": "dell-xps-15-9530",
        "name": 'Dell XPS 15 (9530)',
        "brand": "Dell",
        "category": "Electronics",
        "subcategory": "Laptops",
        "price": "1899",
        "description": "15.6\" OLED, Intel Core i7, RTX 4060, premium build.",
        "file": "dell-xps-15.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Dell_XPS_15_9570.jpg/800px-Dell_XPS_15_9570.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-surface-laptop5",
        "slug": "microsoft-surface-laptop-5",
        "name": "Microsoft Surface Laptop 5",
        "brand": "Microsoft",
        "category": "Electronics",
        "subcategory": "Laptops",
        "price": "1299",
        "description": "13.5\" PixelSense, Intel Evo, Windows 11 fanless.",
        "file": "surface-laptop5.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Surface_Laptop_4_-_Matte_Black.jpg/800px-Surface_Laptop_4_-_Matte_Black.jpg",
        "featured": False,
    },
    # ── Phones ───────────────────────────────────────────────────────────────
    {
        "prodId": "elec-oneplus-12",
        "slug": "oneplus-12",
        "name": "OnePlus 12",
        "brand": "OnePlus",
        "category": "Electronics",
        "subcategory": "Phones",
        "price": "799",
        "description": "Snapdragon 8 Gen 3, 50W wireless, Hasselblad camera.",
        "file": "oneplus-12.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/OnePlus_11_Eternal_Green.jpg/800px-OnePlus_11_Eternal_Green.jpg",
        "featured": False,
    },
    {
        "prodId": "elec-nothing-phone2a",
        "slug": "nothing-phone-2a",
        "name": "Nothing Phone (2a)",
        "brand": "Nothing",
        "category": "Electronics",
        "subcategory": "Phones",
        "price": "349",
        "description": "Dimensity 7200 Pro, Glyph Interface, 50MP dual camera.",
        "file": "nothing-phone-2a.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Nothing_Phone_1.jpg/800px-Nothing_Phone_1.jpg",
        "featured": False,
    },
]

# Extra real-world catalog expansion.
EXTRA_CATALOG = [
    # ── Phones ───────────────────────────────────────────────────────────────
    {"prodId": "elec-iphone-15plus", "slug": "apple-iphone-15-plus", "name": "Apple iPhone 15 Plus", "brand": "Apple", "category": "Electronics", "subcategory": "Phones", "price": "899", "description": "Large display, USB-C, all-day battery life.", "file": "iphone-15-plus.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/IPhone_14_Pro_vector.svg/800px-IPhone_14_Pro_vector.svg.png", "featured": False},
    {"prodId": "elec-pixel-8a", "slug": "google-pixel-8a", "name": "Google Pixel 8a", "brand": "Google", "category": "Electronics", "subcategory": "Phones", "price": "499", "description": "Compact Pixel with great camera and long updates.", "file": "pixel-8a.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Google_Pixel_7.jpg/800px-Google_Pixel_7.jpg", "featured": False},
    # ── Laptops ──────────────────────────────────────────────────────────────
    {"prodId": "elec-hp-spectre-x360", "slug": "hp-spectre-x360-14", "name": "HP Spectre x360 14", "brand": "HP", "category": "Electronics", "subcategory": "Laptops", "price": "1399", "description": "Premium 2-in-1 OLED laptop for productivity.", "file": "hp-spectre-x360.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/HP_Spectre_x360_13.jpg/800px-HP_Spectre_x360_13.jpg", "featured": False},
    {"prodId": "elec-acer-swift-x", "slug": "acer-swift-x-14", "name": "Acer Swift X 14", "brand": "Acer", "category": "Electronics", "subcategory": "Laptops", "price": "1249", "description": "Slim creator laptop with dedicated RTX graphics.", "file": "acer-swift-x.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Acer_Swift_3.jpg/800px-Acer_Swift_3.jpg", "featured": False},
    # ── Tablets ──────────────────────────────────────────────────────────────
    {"prodId": "elec-ipad-air-m2", "slug": "apple-ipad-air-m2", "name": "Apple iPad Air (M2)", "brand": "Apple", "category": "Electronics", "subcategory": "Tablets", "price": "599", "description": "Thin and light tablet with M2 performance.", "file": "ipad-air-m2.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/IPad_Air_4th_generation_sky_blue.jpg/800px-IPad_Air_4th_generation_sky_blue.jpg", "featured": False},
    {"prodId": "elec-lenovo-tab-p12", "slug": "lenovo-tab-p12", "name": "Lenovo Tab P12", "brand": "Lenovo", "category": "Electronics", "subcategory": "Tablets", "price": "379", "description": "Large-screen Android tablet for media and notes.", "file": "lenovo-tab-p12.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Lenovo_Tab_4_10_Plus.jpg/800px-Lenovo_Tab_4_10_Plus.jpg", "featured": False},
    # ── Audio ────────────────────────────────────────────────────────────────
    {"prodId": "elec-sennheiser-momentum4", "slug": "sennheiser-momentum-4", "name": "Sennheiser Momentum 4", "brand": "Sennheiser", "category": "Electronics", "subcategory": "Audio", "price": "349", "description": "Wireless ANC headphones with long battery life.", "file": "sennheiser-momentum4.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Sennheiser_HD_598.jpg/800px-Sennheiser_HD_598.jpg", "featured": False},
    {"prodId": "elec-jbl-flip6", "slug": "jbl-flip-6", "name": "JBL Flip 6", "brand": "JBL", "category": "Electronics", "subcategory": "Audio", "price": "129", "description": "Portable waterproof Bluetooth speaker.", "file": "jbl-flip6.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/JBL_Flip_4.jpg/800px-JBL_Flip_4.jpg", "featured": False},
    # ── TV ───────────────────────────────────────────────────────────────────
    {"prodId": "elec-samsung-s90c", "slug": "samsung-s90c-oled-55", "name": "Samsung S90C OLED 55", "brand": "Samsung", "category": "Electronics", "subcategory": "TV", "price": "1599", "description": "Quantum OLED with vibrant HDR performance.", "file": "samsung-s90c.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Samsung_Smart_TV.jpg/800px-Samsung_Smart_TV.jpg", "featured": True},
    {"prodId": "elec-sony-a80l", "slug": "sony-bravia-a80l-55", "name": "Sony BRAVIA A80L 55", "brand": "Sony", "category": "Electronics", "subcategory": "TV", "price": "1699", "description": "OLED picture quality with Google TV.", "file": "sony-a80l.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sony_Bravia.jpg/800px-Sony_Bravia.jpg", "featured": False},
    # ── Gaming ───────────────────────────────────────────────────────────────
    {"prodId": "elec-ps5-slim", "slug": "sony-playstation-5-slim", "name": "Sony PlayStation 5 Slim", "brand": "Sony", "category": "Electronics", "subcategory": "Gaming", "price": "499", "description": "Slimmer PS5 chassis with same performance.", "file": "ps5-slim.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/PS5_console_%28white%29.jpg/800px-PS5_console_%28white%29.jpg", "featured": False},
    {"prodId": "elec-meta-quest3", "slug": "meta-quest-3", "name": "Meta Quest 3", "brand": "Meta", "category": "Electronics", "subcategory": "Gaming", "price": "499", "description": "Mixed reality headset for games and apps.", "file": "meta-quest3.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Oculus_Quest_2.jpg/800px-Oculus_Quest_2.jpg", "featured": False},
    # ── Accessories ──────────────────────────────────────────────────────────
    {"prodId": "elec-belkin-magsafe", "slug": "belkin-3-in-1-magsafe", "name": "Belkin 3-in-1 MagSafe Charger", "brand": "Belkin", "category": "Electronics", "subcategory": "Accessories", "price": "149", "description": "Fast wireless charging stand for Apple devices.", "file": "belkin-magsafe.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/USB-C_charging_cable.jpg/800px-USB-C_charging_cable.jpg", "featured": False},
    {"prodId": "elec-ugreen-hub", "slug": "ugreen-usb-c-7in1-hub", "name": "UGREEN USB-C 7-in-1 Hub", "brand": "UGREEN", "category": "Electronics", "subcategory": "Accessories", "price": "49", "description": "Portable hub with HDMI, USB, and SD slots.", "file": "ugreen-hub.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/USB_Hub.jpg/800px-USB_Hub.jpg", "featured": False},
    # ── Monitors ─────────────────────────────────────────────────────────────
    {"prodId": "elec-lg-ultragear-27", "slug": "lg-ultragear-27gp850", "name": "LG UltraGear 27GP850", "brand": "LG", "category": "Electronics", "subcategory": "Monitors", "price": "449", "description": "27-inch QHD gaming monitor at high refresh.", "file": "lg-ultragear-27.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/LG_monitor.jpg/800px-LG_monitor.jpg", "featured": False},
    {"prodId": "elec-benq-pd3220u", "slug": "benq-pd3220u", "name": "BenQ PD3220U", "brand": "BenQ", "category": "Electronics", "subcategory": "Monitors", "price": "1099", "description": "4K designer monitor with Thunderbolt 3.", "file": "benq-pd3220u.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/LCD_Monitor.jpg/800px-LCD_Monitor.jpg", "featured": False},
    # ── Storage ──────────────────────────────────────────────────────────────
    {"prodId": "elec-wd-sn850x", "slug": "wd-black-sn850x-2tb", "name": "WD Black SN850X 2TB", "brand": "Western Digital", "category": "Electronics", "subcategory": "Storage", "price": "169", "description": "PCIe 4.0 NVMe SSD for high-speed gaming.", "file": "wd-sn850x.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M.2_NVMe_SSD_2280.jpg/800px-M.2_NVMe_SSD_2280.jpg", "featured": False},
    {"prodId": "elec-sandisk-extreme", "slug": "sandisk-extreme-portable-2tb", "name": "SanDisk Extreme Portable SSD 2TB", "brand": "SanDisk", "category": "Electronics", "subcategory": "Storage", "price": "189", "description": "Rugged USB-C external SSD with fast transfer.", "file": "sandisk-extreme.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/SSD_disk.jpg/800px-SSD_disk.jpg", "featured": False},
    # ── Cameras ──────────────────────────────────────────────────────────────
    {"prodId": "elec-fujifilm-xt5", "slug": "fujifilm-x-t5", "name": "Fujifilm X-T5", "brand": "Fujifilm", "category": "Electronics", "subcategory": "Cameras", "price": "1699", "description": "Retro mirrorless camera with strong image quality.", "file": "fujifilm-xt5.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Fujifilm_X-T20.jpg/800px-Fujifilm_X-T20.jpg", "featured": False},
    {"prodId": "elec-dji-osmo-pocket3", "slug": "dji-osmo-pocket-3", "name": "DJI Osmo Pocket 3", "brand": "DJI", "category": "Electronics", "subcategory": "Cameras", "price": "519", "description": "Pocket gimbal camera with stabilized 4K video.", "file": "dji-osmo-pocket3.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/DJI_Osmo.jpg/800px-DJI_Osmo.jpg", "featured": False},
    # ── Wearables ────────────────────────────────────────────────────────────
    {"prodId": "elec-fitbit-charge6", "slug": "fitbit-charge-6", "name": "Fitbit Charge 6", "brand": "Fitbit", "category": "Electronics", "subcategory": "Wearables", "price": "159", "description": "Advanced fitness tracker with heart-rate insights.", "file": "fitbit-charge6.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Fitbit_Charge_2.jpg/800px-Fitbit_Charge_2.jpg", "featured": False},
    {"prodId": "elec-whoop-4", "slug": "whoop-4-0", "name": "WHOOP 4.0", "brand": "WHOOP", "category": "Electronics", "subcategory": "Wearables", "price": "239", "description": "Recovery and strain tracking wearable band.", "file": "whoop-4.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Fitness_tracker.jpg/800px-Fitness_tracker.jpg", "featured": False},
    # ── Smart Home ───────────────────────────────────────────────────────────
    {"prodId": "elec-philips-hue-starter", "slug": "philips-hue-starter-kit", "name": "Philips Hue Starter Kit", "brand": "Philips", "category": "Electronics", "subcategory": "Smart home", "price": "189", "description": "Smart lights with color scenes and automations.", "file": "philips-hue-starter.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Philips_Hue_lights.jpg/800px-Philips_Hue_lights.jpg", "featured": False},
    {"prodId": "elec-nest-thermostat", "slug": "google-nest-thermostat", "name": "Google Nest Thermostat", "brand": "Google", "category": "Electronics", "subcategory": "Smart home", "price": "129", "description": "Energy-saving smart thermostat with app control.", "file": "nest-thermostat.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Nest_Learning_Thermostat.png/800px-Nest_Learning_Thermostat.png", "featured": False},
    # ── New subcategories for broader catalog ───────────────────────────────
    {"prodId": "elec-imac-m3", "slug": "apple-imac-24-m3", "name": "Apple iMac 24 (M3)", "brand": "Apple", "category": "Electronics", "subcategory": "Desktops", "price": "1299", "description": "All-in-one desktop with vibrant Retina display.", "file": "imac-m3.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/IMac_24_M1.jpg/800px-IMac_24_M1.jpg", "featured": True},
    {"prodId": "elec-hp-laserjet-mfp", "slug": "hp-laserjet-pro-mfp-4101", "name": "HP LaserJet Pro MFP 4101", "brand": "HP", "category": "Electronics", "subcategory": "Printers", "price": "429", "description": "Fast monochrome office printer with scan/copy.", "file": "hp-laserjet-mfp.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Laser_printer.jpg/800px-Laser_printer.jpg", "featured": False},
    {"prodId": "elec-asus-rt-ax88u", "slug": "asus-rt-ax88u-pro", "name": "ASUS RT-AX88U Pro", "brand": "ASUS", "category": "Electronics", "subcategory": "Networking", "price": "299", "description": "Wi-Fi 6 router for high-speed home networking.", "file": "asus-rt-ax88u.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Wireless_router.jpg/800px-Wireless_router.jpg", "featured": False},
    {"prodId": "elec-dji-mini4pro", "slug": "dji-mini-4-pro", "name": "DJI Mini 4 Pro", "brand": "DJI", "category": "Electronics", "subcategory": "Drones", "price": "759", "description": "Compact 4K camera drone with obstacle sensing.", "file": "dji-mini4pro.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/DJI_Mavic_Pro.jpg/800px-DJI_Mavic_Pro.jpg", "featured": True},
]

MORE_CATALOG = [
    # ── Phones ───────────────────────────────────────────────────────────────
    {"prodId": "elec-moto-edge-50", "slug": "motorola-edge-50-pro", "name": "Motorola Edge 50 Pro", "brand": "Motorola", "category": "Electronics", "subcategory": "Phones", "price": "699", "description": "Curved OLED phone with fast charging and clean Android.", "file": "moto-edge-50.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Moto_G7_Plus.jpg/800px-Moto_G7_Plus.jpg", "featured": False},
    {"prodId": "elec-xiaomi-14", "slug": "xiaomi-14", "name": "Xiaomi 14", "brand": "Xiaomi", "category": "Electronics", "subcategory": "Phones", "price": "799", "description": "Compact flagship with Leica-tuned camera system.", "file": "xiaomi-14.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Xiaomi_Mi_9.jpg/800px-Xiaomi_Mi_9.jpg", "featured": False},
    # ── Laptops ──────────────────────────────────────────────────────────────
    {"prodId": "elec-razer-blade-16", "slug": "razer-blade-16", "name": "Razer Blade 16", "brand": "Razer", "category": "Electronics", "subcategory": "Laptops", "price": "2799", "description": "Premium gaming laptop with high-end RTX graphics.", "file": "razer-blade-16.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Razer_Blade_15_2018.jpg/800px-Razer_Blade_15_2018.jpg", "featured": True},
    {"prodId": "elec-lg-gram-16", "slug": "lg-gram-16", "name": "LG gram 16", "brand": "LG", "category": "Electronics", "subcategory": "Laptops", "price": "1499", "description": "Ultra-light productivity laptop with large display.", "file": "lg-gram-16.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/LG_Gram_17.jpg/800px-LG_Gram_17.jpg", "featured": False},
    # ── Tablets ──────────────────────────────────────────────────────────────
    {"prodId": "elec-onyx-boox-tabx", "slug": "onyx-boox-tab-x", "name": "ONYX BOOX Tab X", "brand": "ONYX", "category": "Electronics", "subcategory": "Tablets", "price": "879", "description": "13.3-inch E Ink tablet for notes and reading.", "file": "boox-tabx.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Amazon_Kindle_3.jpg/800px-Amazon_Kindle_3.jpg", "featured": False},
    {"prodId": "elec-amazon-fire-max11", "slug": "amazon-fire-max-11", "name": "Amazon Fire Max 11", "brand": "Amazon", "category": "Electronics", "subcategory": "Tablets", "price": "229", "description": "Affordable media tablet with optional keyboard and pen.", "file": "fire-max-11.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Kindle_Fire_HD.jpg/800px-Kindle_Fire_HD.jpg", "featured": False},
    # ── Audio ────────────────────────────────────────────────────────────────
    {"prodId": "elec-sonos-era-100", "slug": "sonos-era-100", "name": "Sonos Era 100", "brand": "Sonos", "category": "Electronics", "subcategory": "Audio", "price": "249", "description": "Smart speaker with rich stereo sound and voice control.", "file": "sonos-era-100.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Sonos_Play_One.jpg/800px-Sonos_Play_One.jpg", "featured": False},
    {"prodId": "elec-audioengine-a5", "slug": "audioengine-a5-plus", "name": "Audioengine A5+ Wireless", "brand": "Audioengine", "category": "Electronics", "subcategory": "Audio", "price": "499", "description": "Powered bookshelf speakers for desktop audio.", "file": "audioengine-a5.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Bookshelf_speakers.jpg/800px-Bookshelf_speakers.jpg", "featured": False},
    # ── TV ───────────────────────────────────────────────────────────────────
    {"prodId": "elec-tcl-qm8", "slug": "tcl-qm8-65", "name": "TCL QM8 65", "brand": "TCL", "category": "Electronics", "subcategory": "TV", "price": "1199", "description": "Mini-LED 4K TV with high brightness and gaming features.", "file": "tcl-qm8.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flat_screen_television.jpg/800px-Flat_screen_television.jpg", "featured": False},
    {"prodId": "elec-hisense-u8k", "slug": "hisense-u8k-65", "name": "Hisense U8K 65", "brand": "Hisense", "category": "Electronics", "subcategory": "TV", "price": "1099", "description": "High-performance 4K mini-LED TV for movies and games.", "file": "hisense-u8k.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/LED_TV.jpg/800px-LED_TV.jpg", "featured": False},
    # ── Gaming ───────────────────────────────────────────────────────────────
    {"prodId": "elec-logitech-g923", "slug": "logitech-g923-racing-wheel", "name": "Logitech G923 Racing Wheel", "brand": "Logitech", "category": "Electronics", "subcategory": "Gaming", "price": "399", "description": "Force-feedback racing wheel for console and PC.", "file": "logitech-g923.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Logitech_G27.jpg/800px-Logitech_G27.jpg", "featured": False},
    {"prodId": "elec-8bitdo-ultimate", "slug": "8bitdo-ultimate-controller", "name": "8BitDo Ultimate Controller", "brand": "8BitDo", "category": "Electronics", "subcategory": "Gaming", "price": "69", "description": "Multi-platform wireless game controller with dock.", "file": "8bitdo-ultimate.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Gamepad.jpg/800px-Gamepad.jpg", "featured": False},
    # ── Accessories ──────────────────────────────────────────────────────────
    {"prodId": "elec-samsung-t7-shield", "slug": "samsung-t7-shield-2tb", "name": "Samsung T7 Shield 2TB", "brand": "Samsung", "category": "Electronics", "subcategory": "Accessories", "price": "169", "description": "Durable portable SSD for creators on the go.", "file": "samsung-t7-shield.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/SSD_disk.jpg/800px-SSD_disk.jpg", "featured": False},
    {"prodId": "elec-peakdesign-everyday", "slug": "peak-design-everyday-backpack", "name": "Peak Design Everyday Backpack", "brand": "Peak Design", "category": "Electronics", "subcategory": "Accessories", "price": "299", "description": "Camera and tech backpack with modular dividers.", "file": "peakdesign-everyday.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Backpack.jpg/800px-Backpack.jpg", "featured": False},
    # ── Monitors ─────────────────────────────────────────────────────────────
    {"prodId": "elec-msi-mag274qrf", "slug": "msi-mag274qrf-qd", "name": "MSI MAG274QRF-QD", "brand": "MSI", "category": "Electronics", "subcategory": "Monitors", "price": "429", "description": "QHD gaming monitor with quantum-dot color.", "file": "msi-mag274qrf.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/LCD_Monitor.jpg/800px-LCD_Monitor.jpg", "featured": False},
    {"prodId": "elec-aoc-agon-pro", "slug": "aoc-agon-pro-ag274qg", "name": "AOC AGON PRO AG274QG", "brand": "AOC", "category": "Electronics", "subcategory": "Monitors", "price": "699", "description": "High-refresh esports monitor with low latency.", "file": "aoc-agon-pro.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Dell_U2410_monitor_-_20100709.jpg/800px-Dell_U2410_monitor_-_20100709.jpg", "featured": False},
    # ── Storage ──────────────────────────────────────────────────────────────
    {"prodId": "elec-seagate-ironwolf", "slug": "seagate-ironwolf-8tb", "name": "Seagate IronWolf 8TB", "brand": "Seagate", "category": "Electronics", "subcategory": "Storage", "price": "219", "description": "NAS hard drive designed for always-on storage.", "file": "seagate-ironwolf.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Hard_disk_drive.jpg/800px-Hard_disk_drive.jpg", "featured": False},
    {"prodId": "elec-crucial-x9", "slug": "crucial-x9-pro-2tb", "name": "Crucial X9 Pro 2TB", "brand": "Crucial", "category": "Electronics", "subcategory": "Storage", "price": "159", "description": "Portable USB-C SSD for fast backups.", "file": "crucial-x9.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/External_hard_drive.jpg/800px-External_hard_drive.jpg", "featured": False},
    # ── Cameras ──────────────────────────────────────────────────────────────
    {"prodId": "elec-canon-r6ii", "slug": "canon-eos-r6-mark-ii", "name": "Canon EOS R6 Mark II", "brand": "Canon", "category": "Electronics", "subcategory": "Cameras", "price": "2499", "description": "Fast full-frame mirrorless camera for hybrid shooters.", "file": "canon-r6ii.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Canon_EOS_R6.jpg/800px-Canon_EOS_R6.jpg", "featured": True},
    {"prodId": "elec-nikon-zf", "slug": "nikon-zf", "name": "Nikon Zf", "brand": "Nikon", "category": "Electronics", "subcategory": "Cameras", "price": "1999", "description": "Retro-style full-frame mirrorless with strong autofocus.", "file": "nikon-zf.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Nikon_Z6_II.jpg/800px-Nikon_Z6_II.jpg", "featured": False},
    # ── Wearables ────────────────────────────────────────────────────────────
    {"prodId": "elec-polar-vantage-v3", "slug": "polar-vantage-v3", "name": "Polar Vantage V3", "brand": "Polar", "category": "Electronics", "subcategory": "Wearables", "price": "599", "description": "Advanced training watch for endurance athletes.", "file": "polar-vantage-v3.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sports_watch.jpg/800px-Sports_watch.jpg", "featured": False},
    {"prodId": "elec-suunto-race", "slug": "suunto-race", "name": "Suunto Race", "brand": "Suunto", "category": "Electronics", "subcategory": "Wearables", "price": "449", "description": "AMOLED multisport watch with offline maps.", "file": "suunto-race.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Suunto_watch.jpg/800px-Suunto_watch.jpg", "featured": False},
    # ── Smart home ───────────────────────────────────────────────────────────
    {"prodId": "elec-ecobee-premium", "slug": "ecobee-smart-thermostat-premium", "name": "ecobee Smart Thermostat Premium", "brand": "ecobee", "category": "Electronics", "subcategory": "Smart home", "price": "249", "description": "Smart thermostat with built-in sensors and air quality.", "file": "ecobee-premium.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Nest_Learning_Thermostat.png/800px-Nest_Learning_Thermostat.png", "featured": False},
    {"prodId": "elec-aqara-g4", "slug": "aqara-smart-video-doorbell-g4", "name": "Aqara Smart Video Doorbell G4", "brand": "Aqara", "category": "Electronics", "subcategory": "Smart home", "price": "119", "description": "HomeKit-compatible smart doorbell with local AI alerts.", "file": "aqara-g4.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Ring_Video_Doorbell_Pro_2.jpg/800px-Ring_Video_Doorbell_Pro_2.jpg", "featured": False},
]

FINAL_CATALOG = [
    # ── Phones ───────────────────────────────────────────────────────────────
    {"prodId": "elec-honor-magic6", "slug": "honor-magic-6-pro", "name": "HONOR Magic 6 Pro", "brand": "HONOR", "category": "Electronics", "subcategory": "Phones", "price": "999", "description": "Flagship phone with bright OLED panel and long battery life.", "file": "honor-magic6.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Smartphone.jpg/800px-Smartphone.jpg", "featured": False},
    # ── Laptops ──────────────────────────────────────────────────────────────
    {"prodId": "elec-framework-13", "slug": "framework-laptop-13", "name": "Framework Laptop 13", "brand": "Framework", "category": "Electronics", "subcategory": "Laptops", "price": "1249", "description": "Repairable modular laptop with upgradeable parts.", "file": "framework-13.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Laptop.jpg/800px-Laptop.jpg", "featured": True},
    # ── Audio ────────────────────────────────────────────────────────────────
    {"prodId": "elec-shure-mv7plus", "slug": "shure-mv7-plus", "name": "Shure MV7+ Podcast Microphone", "brand": "Shure", "category": "Electronics", "subcategory": "Audio", "price": "279", "description": "Dynamic USB/XLR microphone for streaming and podcasting.", "file": "shure-mv7plus.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Microphone.jpg/800px-Microphone.jpg", "featured": False},
    # ── TV ───────────────────────────────────────────────────────────────────
    {"prodId": "elec-philips-oled808", "slug": "philips-oled808-55", "name": "Philips OLED808 55", "brand": "Philips", "category": "Electronics", "subcategory": "TV", "price": "1499", "description": "4K OLED TV with immersive Ambilight lighting.", "file": "philips-oled808.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flat_screen_television.jpg/800px-Flat_screen_television.jpg", "featured": False},
    # ── Gaming ───────────────────────────────────────────────────────────────
    {"prodId": "elec-elgato-streamdeck", "slug": "elgato-stream-deck-mk2", "name": "Elgato Stream Deck MK.2", "brand": "Elgato", "category": "Electronics", "subcategory": "Gaming", "price": "149", "description": "Custom macro controller for streamers and creators.", "file": "elgato-streamdeck.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Keyboard.jpg/800px-Keyboard.jpg", "featured": False},
    # ── Accessories ──────────────────────────────────────────────────────────
    {"prodId": "elec-anker-prime-powerbank", "slug": "anker-prime-powerbank-20000", "name": "Anker Prime Power Bank 20,000mAh", "brand": "Anker", "category": "Electronics", "subcategory": "Accessories", "price": "129", "description": "High-output USB-C power bank for laptops and phones.", "file": "anker-prime-powerbank.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Power_bank.jpg/800px-Power_bank.jpg", "featured": False},
    # ── Monitors ─────────────────────────────────────────────────────────────
    {"prodId": "elec-viewsonic-vx2728", "slug": "viewsonic-vx2728-2k", "name": "ViewSonic VX2728-2K", "brand": "ViewSonic", "category": "Electronics", "subcategory": "Monitors", "price": "299", "description": "Affordable QHD gaming monitor with high refresh rate.", "file": "viewsonic-vx2728.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/LCD_Monitor.jpg/800px-LCD_Monitor.jpg", "featured": False},
    # ── Storage ──────────────────────────────────────────────────────────────
    {"prodId": "elec-kingston-kc3000", "slug": "kingston-kc3000-2tb", "name": "Kingston KC3000 2TB", "brand": "Kingston", "category": "Electronics", "subcategory": "Storage", "price": "179", "description": "High-end PCIe 4.0 NVMe SSD for heavy workloads.", "file": "kingston-kc3000.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M.2_NVMe_SSD_2280.jpg/800px-M.2_NVMe_SSD_2280.jpg", "featured": False},
    # ── Cameras ──────────────────────────────────────────────────────────────
    {"prodId": "elec-panasonic-s5ii", "slug": "panasonic-lumix-s5ii", "name": "Panasonic Lumix S5 II", "brand": "Panasonic", "category": "Electronics", "subcategory": "Cameras", "price": "1999", "description": "Full-frame hybrid camera with strong video features.", "file": "panasonic-s5ii.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Digital_camera.jpg/800px-Digital_camera.jpg", "featured": False},
    # ── Wearables ────────────────────────────────────────────────────────────
    {"prodId": "elec-galaxy-ring", "slug": "samsung-galaxy-ring", "name": "Samsung Galaxy Ring", "brand": "Samsung", "category": "Electronics", "subcategory": "Wearables", "price": "399", "description": "Smart ring for sleep and wellness tracking.", "file": "galaxy-ring.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Ring.jpg/800px-Ring.jpg", "featured": False},
    # ── Smart home ───────────────────────────────────────────────────────────
    {"prodId": "elec-eufy-cam-3", "slug": "eufy-cam-3-kit", "name": "eufyCam 3 Security Kit", "brand": "eufy", "category": "Electronics", "subcategory": "Smart home", "price": "549", "description": "4K wireless home security cameras with local storage.", "file": "eufy-cam-3.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Surveillance_camera.jpg/800px-Surveillance_camera.jpg", "featured": False},
    # ── Drones ───────────────────────────────────────────────────────────────
    {"prodId": "elec-autel-evo-lite", "slug": "autel-evo-lite-plus", "name": "Autel EVO Lite+", "brand": "Autel", "category": "Electronics", "subcategory": "Drones", "price": "1199", "description": "Camera drone with large sensor and long flight time.", "file": "autel-evo-lite.jpg", "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Quadcopter.jpg/800px-Quadcopter.jpg", "featured": False},
]

CATALOG.extend(EXTRA_CATALOG)
CATALOG.extend(MORE_CATALOG)
CATALOG.extend(FINAL_CATALOG)
CATALOG.extend(expansion_hundred_one())

def download_images() -> None:
    dest = ROOT / "public" / "catalog"
    dest.mkdir(parents=True, exist_ok=True)
    for item in CATALOG:
        target = dest / item["file"]
        if target.exists() and target.stat().st_size > 2000:
            continue
        try:
            print("Downloading", item["file"], "...")
            download_file(item["url"], target)
            if target.stat().st_size <= 2000:
                print("  WARN: tiny file", item["file"])
        except Exception as e:
            print("  WARN:", item["file"], e)


def build_purchases() -> list[dict]:
    trending = [
        "elec-iphone-15", "elec-galaxy-s24", "elec-macbook-air", "elec-sony-wh1000xm5",
        "elec-ps5", "elec-xbox-series-x", "elec-steam-deck", "elec-sony-a7iv",
        "elec-apple-watch-ultra2",
    ]
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


def purchase_weight(prod_id: str) -> float:
    pid = prod_id.lower()
    if any(k in pid for k in ("iphone", "galaxy-s24", "macbook", "ps5", "steam-deck", "pixel-8")):
        return 18.0
    if any(k in pid for k in ("ipad", "airpods", "switch", "xbox", "galaxy-z")):
        return 12.0
    if "elec-exp-" in prod_id:
        return 7.0
    return 4.5


def build_rich_purchases(
    prod_ids: list[str],
    *,
    num_users: int = 280,
    target_avg: float = 17.0,
    rng: random.Random | None = None,
) -> list[dict]:
    """Weighted random purchases so bestsellers get more realistic volume."""
    rng = rng or random.Random(42)
    weights = [purchase_weight(pid) for pid in prod_ids]
    rows: list[dict] = []
    now = datetime.now(timezone.utc)
    for i in range(1, num_users + 1):
        uid = f"synthetic_shop_{i:04d}"
        n = max(4, min(52, int(rng.gauss(target_avg, 4.5))))
        picks = rng.choices(prod_ids, weights=weights, k=n)
        for pid in picks:
            rows.append(
                {
                    "userId": uid,
                    "prodId": pid,
                    "createdAt": now - timedelta(days=rng.randint(0, 380)),
                }
            )
    return rows


def build_sparse_ratings(
    purchase_rows: list[dict],
    *,
    rating_probability: float = 0.28,
    rng: random.Random | None = None,
) -> list[dict]:
    """Not every shopper leaves a rating — sparse realistic coverage."""
    rng = rng or random.Random(43)
    seen: set[tuple[str, str]] = set()
    out: list[dict] = []
    for row in purchase_rows:
        if rng.random() > rating_probability:
            continue
        uid = row["userId"]
        pid = row["prodId"]
        key = (uid, pid)
        if key in seen:
            continue
        seen.add(key)
        rating = rng.choices([2, 3, 4, 5], weights=[1, 2, 4, 5])[0]
        out.append({"prodId": pid, "userId": uid, "rating": rating})
    return out


def sync_product_rating_fields(db) -> None:
    """Denormalize ratingAvg + reviews on products from productratings."""
    agg_rows = list(
        db["productratings"].aggregate(
            [{"$group": {"_id": "$prodId", "reviews": {"$sum": 1}, "ratingAvg": {"$avg": "$rating"}}}]
        )
    )
    by_pid = {str(r["_id"]): r for r in agg_rows}
    for doc in db["products"].find({}, {"_id": 1, "prodId": 1}):
        pid = str(doc.get("prodId") or "")
        st = by_pid.get(pid)
        db["products"].update_one(
            {"_id": doc["_id"]},
            {
                "$set": {
                    "reviews": int(st["reviews"]) if st else 0,
                    "ratingAvg": round(float(st["ratingAvg"]), 2) if st else 0,
                }
            },
        )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--demo-purchases",
        action="store_true",
        help="Insert legacy synthetic purchase rows (small demo).",
    )
    ap.add_argument(
        "--rich-demo",
        action="store_true",
        help="Replace purchases + productratings with ~280 users (~17 purchases avg), sparse ratings, sync product stars.",
    )
    ap.add_argument(
        "--skip-image-download",
        action="store_true",
        help="Do not mirror images into public/catalog (recommended when using remote Wikimedia imgSrc).",
    )
    ap.add_argument(
        "--local-img-src",
        action="store_true",
        help="Store imgSrc as /catalog/... — requires files under public/catalog.",
    )
    args = ap.parse_args()

    if args.demo_purchases and args.rich_demo:
        print("Use only one of --demo-purchases or --rich-demo.")
        sys.exit(1)

    if not args.skip_image_download:
        download_images()
    db = get_db()
    db["products"].delete_many({})

    products = []
    for item in CATALOG:
        rel = f"/catalog/{item['file']}"
        if args.local_img_src:
            img_src = rel
            file_key = f"local:{rel}"
        else:
            img_src = item["url"]
            file_key = f"wikimedia:{item['slug']}"

        products.append(
            {
                "prodId": item["prodId"],
                "slug": item["slug"],
                "imgSrc": img_src,
                "fileKey": file_key,
                "name": item["name"],
                "brand": item["brand"],
                "category": item["category"],
                "subcategory": item["subcategory"],
                "price": item["price"],
                "description": item["description"],
                "ratingAvg": 0,
                "reviews": 0,
                "stock": random.randint(5, 120),
                "featured": item["featured"],
            }
        )

    db["products"].insert_many(products)
    msg = f"Inserted {len(products)} products into {db.name!r}."

    if args.rich_demo:
        db["purchases"].delete_many({})
        db["productratings"].delete_many({})
        all_ids = [p["prodId"] for p in products]
        rng = random.Random(20260509)
        purch_rows = build_rich_purchases(all_ids, num_users=280, target_avg=17.0, rng=rng)
        db["purchases"].insert_many(purch_rows)
        rating_docs = build_sparse_ratings(purch_rows, rating_probability=0.28, rng=rng)
        if rating_docs:
            db["productratings"].insert_many(rating_docs)
        sync_product_rating_fields(db)
        avg_u = len(purch_rows) / 280
        msg += (
            f" Rich demo: {len(purch_rows)} purchases (~{avg_u:.1f} per user), "
            f"{len(rating_docs)} sparse ratings in productratings."
        )
    elif args.demo_purchases:
        db["purchases"].delete_many({})
        db["purchases"].insert_many(build_purchases())
        msg += f" Demo purchases: {db['purchases'].count_documents({})} rows."
    else:
        msg += " Purchases/ratings unchanged (use --rich-demo or --demo-purchases)."

    print(msg)


if __name__ == "__main__":
    main()
