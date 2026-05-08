"""
101 additional electronics SKUs with Wikimedia Commons imagery grouped by category.
Matched URLs reuse thumbnails already used elsewhere in the Volta seed (verified domains).

Imported by seed_database.py — run seed via `python scripts/seed_database.py`.
"""

from __future__ import annotations

_IMG = {
    "phone_apple": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/IPhone_15_Pro_Vector.svg/800px-IPhone_15_Pro_Vector.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/IPhone_14_Pro_vector.svg/800px-IPhone_14_Pro_vector.svg.png",
    ],
    "phone_samsung": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Samsung_Galaxy_S23_Ultra_Green.jpg/800px-Samsung_Galaxy_S23_Ultra_Green.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Samsung_Galaxy_Tab_S8_Ultra.jpg/800px-Samsung_Galaxy_Tab_S8_Ultra.jpg",
    ],
    "phone_google": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Google_Pixel_8_Pro_back.jpg/800px-Google_Pixel_8_Pro_back.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Google_Pixel_7.jpg/800px-Google_Pixel_7.jpg",
    ],
    "phone_android_other": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/OnePlus_11_Eternal_Green.jpg/800px-OnePlus_11_Eternal_Green.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Nothing_Phone_1.jpg/800px-Nothing_Phone_1.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Moto_G7_Plus.jpg/800px-Moto_G7_Plus.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Xiaomi_Mi_9.jpg/800px-Xiaomi_Mi_9.jpg",
    ],
    "laptop_mac": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/MacBook_Pro_16_inch_Space_Gray_2019.jpg/800px-MacBook_Pro_16_inch_Space_Gray_2019.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/IMac_24_M1.jpg/800px-IMac_24_M1.jpg",
    ],
    "laptop_win": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Lenovo_ThinkPad_X1_Carbon_2017_%28black%29.jpg/800px-Lenovo_ThinkPad_X1_Carbon_2017_%28black%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Asus_ROG_Zephyrus_G14_2022.jpg/800px-Asus_ROG_Zephyrus_G14_2022.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Dell_XPS_15_9570.jpg/800px-Dell_XPS_15_9570.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Surface_Laptop_4_-_Matte_Black.jpg/800px-Surface_Laptop_4_-_Matte_Black.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Acer_Swift_3.jpg/800px-Acer_Swift_3.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/HP_Spectre_x360_13.jpg/800px-HP_Spectre_x360_13.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Razer_Blade_15_2018.jpg/800px-Razer_Blade_15_2018.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/LG_Gram_17.jpg/800px-LG_Gram_17.jpg",
    ],
    "tablet": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/IPad_Pro_11_4th_generation_space_gray.jpg/800px-IPad_Pro_11_4th_generation_space_gray.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/IPad_Air_4th_generation_sky_blue.jpg/800px-IPad_Air_4th_generation_sky_blue.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Samsung_Galaxy_Tab_S8_Ultra.jpg/800px-Samsung_Galaxy_Tab_S8_Ultra.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Lenovo_Tab_4_10_Plus.jpg/800px-Lenovo_Tab_4_10_Plus.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Kindle_Fire_HD.jpg/800px-Kindle_Fire_HD.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Amazon_Kindle_3.jpg/800px-Amazon_Kindle_3.jpg",
    ],
    "audio_hp": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Sony_1000XM4.jpg/800px-Sony_1000XM4.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Sennheiser_HD_598.jpg/800px-Sennheiser_HD_598.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/AirPods_Max_Black.jpg/800px-AirPods_Max_Black.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Bose_QuietComfort_35_II.jpg/800px-Bose_QuietComfort_35_II.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/JBL_Flip_4.jpg/800px-JBL_Flip_4.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Sonos_Play_One.jpg/800px-Sonos_Play_One.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Bookshelf_speakers.jpg/800px-Bookshelf_speakers.jpg",
    ],
    "tv": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/LG_OLED_TV_2016.jpg/800px-LG_OLED_TV_2016.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Samsung_Smart_TV.jpg/800px-Samsung_Smart_TV.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sony_Bravia.jpg/800px-Sony_Bravia.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flat_screen_television.jpg/800px-Flat_screen_television.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/LED_TV.jpg/800px-LED_TV.jpg",
    ],
    "gaming": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Nintendo-Switch-wJoyConsBlRdStand-H.jpg/800px-Nintendo-Switch-wJoyConsBlRdStand-H.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/PS5_console_%28white%29.jpg/800px-PS5_console_%28white%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Xbox_Series_X_-_1_%28cropped%29.jpg/800px-Xbox_Series_X_-_1_%28cropped%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Steam_Deck_-_Front_View.jpg/800px-Steam_Deck_-_Front_View.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Oculus_Quest_2.jpg/800px-Oculus_Quest_2.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Logitech_G27.jpg/800px-Logitech_G27.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Gamepad.jpg/800px-Gamepad.jpg",
    ],
    "accessory": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/USB-C_charging_cable.jpg/800px-USB-C_charging_cable.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/USB_Hub.jpg/800px-USB_Hub.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/SSD_disk.jpg/800px-SSD_disk.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/External_hard_drive.jpg/800px-External_hard_drive.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Power_bank.jpg/800px-Power_bank.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Backpack.jpg/800px-Backpack.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Mechanical_keyboard_%28Unsplash%29.jpg/800px-Mechanical_keyboard_%28Unsplash%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Logitech_MX_Master_2S.jpg/800px-Logitech_MX_Master_2S.jpg",
    ],
    "monitor": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Dell_U2410_monitor_-_20100709.jpg/800px-Dell_U2410_monitor_-_20100709.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Samsung_Curved_Monitor.jpg/800px-Samsung_Curved_Monitor.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/LG_monitor.jpg/800px-LG_monitor.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/LCD_Monitor.jpg/800px-LCD_Monitor.jpg",
    ],
    "storage": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M.2_NVMe_SSD_2280.jpg/800px-M.2_NVMe_SSD_2280.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Hard_disk_drive.jpg/800px-Hard_disk_drive.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/SSD_disk.jpg/800px-SSD_disk.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/External_hard_drive.jpg/800px-External_hard_drive.jpg",
    ],
    "camera": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Sony_Alpha_7R_IV_01.jpg/800px-Sony_Alpha_7R_IV_01.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Canon_EOS_M50.jpg/800px-Canon_EOS_M50.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/GoPro_Hero10.jpg/800px-GoPro_Hero10.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Fujifilm_X-T20.jpg/800px-Fujifilm_X-T20.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/DJI_Osmo.jpg/800px-DJI_Osmo.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Canon_EOS_R6.jpg/800px-Canon_EOS_R6.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Nikon_Z6_II.jpg/800px-Nikon_Z6_II.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Digital_camera.jpg/800px-Digital_camera.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/DJI_Mavic_Pro.jpg/800px-DJI_Mavic_Pro.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Quadcopter.jpg/800px-Quadcopter.jpg",
    ],
    "wearable": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Apple_Watch_Series_7_product_page.jpg/800px-Apple_Watch_Series_7_product_page.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Samsung_Galaxy_Watch_4.jpg/800px-Samsung_Galaxy_Watch_4.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Garmin_Fenix_3_silver.jpg/800px-Garmin_Fenix_3_silver.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Fitbit_Charge_2.jpg/800px-Fitbit_Charge_2.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sports_watch.jpg/800px-Sports_watch.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Suunto_watch.jpg/800px-Suunto_watch.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Fitness_tracker.jpg/800px-Fitness_tracker.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Ring.jpg/800px-Ring.jpg",
    ],
    "smarthome": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Nest_Mini_%28Charcoal%29.jpg/800px-Google_Nest_Mini_%28Charcoal%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Amazon_Echo_Dot_2nd_Generation.jpg/800px-Amazon_Echo_Dot_2nd_Generation.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Ring_Video_Doorbell_Pro_2.jpg/800px-Ring_Video_Doorbell_Pro_2.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Philips_Hue_lights.jpg/800px-Philips_Hue_lights.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Nest_Learning_Thermostat.png/800px-Nest_Learning_Thermostat.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Surveillance_camera.jpg/800px-Surveillance_camera.jpg",
    ],
    "desktop_printer_network": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/IMac_24_M1.jpg/800px-IMac_24_M1.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Laser_printer.jpg/800px-Laser_printer.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Wireless_router.jpg/800px-Wireless_router.jpg",
    ],
}


def _pick(pool_key: str, salt: int) -> str:
    urls = _IMG[pool_key]
    return urls[salt % len(urls)]


def _phone_pool_for_brand(brand: str) -> str:
    b = brand.lower()
    if "apple" in b:
        return "phone_apple"
    if "google" in b:
        return "phone_google"
    if "samsung" in b:
        return "phone_samsung"
    return "phone_android_other"


def expansion_hundred_one() -> list[dict]:
    """Returns exactly 101 catalog dicts compatible with seed_database.CATALOG format."""
    items: list[tuple[str, str, str, str, str, str, str, bool]] = []

    # Phones (18)
    phones = [
        ("vivo-x100-ultra", "vivo X100 Ultra", "vivo", "Phones", "1199", "Zeiss APO telephoto and huge sensor mobile imaging."),
        ("oppo-find-x8-pro", "OPPO Find X8 Pro", "OPPO", "Phones", "1099", "Dual periscope zoom Hasselblad tuned cameras."),
        ("realme-gt7-pro", "realme GT 7 Pro", "realme", "Phones", "699", "Snapdragon flagship with bright OLED gaming dial."),
        ("asus-zenfone-11", "ASUS Zenfone 11", "ASUS", "Phones", "799", "Compact flagship with gimbal-style stabilization."),
        ("tecno-phantom-v-fold", "Tecno Phantom V Fold", "Tecno", "Phones", "949", "Book-style foldable with dual LTPO panels."),
        ("fairphone-5", "Fairphone 5", "Fairphone", "Phones", "699", "Repairable modular Android phone with long support."),
        ("purism-liberty-5", "Purism Liberty Phone", "Purism", "Phones", "899", "Privacy-focused Linux smartphone."),
        ("sony-xperia-1-vi", "Sony Xperia 1 VI", "Sony", "Phones", "1399", "Creator-focused phone with variable zoom optics."),
        ("nothing-phone-3", "Nothing Phone (3)", "Nothing", "Phones", "749", "Glyph LED notifications with clean Nothing OS."),
        ("motorola-razr-2025", "Motorola razr 2025", "Motorola", "Phones", "999", "Flip phone form factor with large cover screen."),
        ("tecno-camon-30-pro", "Tecno Camon 30 Pro", "Tecno", "Phones", "349", "Portrait-centric mid-range shooter."),
        ("infinix-zero-40", "Infinix Zero 40", "Infinix", "Phones", "429", "Fast charging curved AMOLED daily driver."),
        ("google-pixel-9-pro-xl", "Google Pixel 9 Pro XL", "Google", "Phones", "1099", "Tensor G4 AI photography on a large display."),
        ("google-pixel-fold-2", "Google Pixel Fold 2", "Google", "Phones", "1799", "Tensor-powered tablet-phone hybrid multitasking."),
        ("samsung-galaxy-z-fold6", "Samsung Galaxy Z Fold6", "Samsung", "Phones", "1899", "Productivity foldable with slim hinge profile."),
        ("samsung-galaxy-a55", "Samsung Galaxy A55", "Samsung", "Phones", "449", "Glass-metal mid-range with Knox security."),
        ("apple-iphone-16-pro-max", "Apple iPhone 16 Pro Max", "Apple", "Phones", "1199", "Largest Pro model with advanced camera controls."),
        ("apple-iphone-16e", "Apple iPhone 16e", "Apple", "Phones", "599", "Affordable iPhone with flagship chip basics."),
    ]
    for i, p in enumerate(phones):
        slug, name, brand, sub, price, desc = p
        pk = _phone_pool_for_brand(brand)
        items.append((slug, name, brand, sub, price, desc, pk, i == 14))

    # Laptops (14)
    laps = [
        ("msi-stealth-16-ai", "MSI Stealth 16 AI Studio", "MSI", "Laptops", "2099", "Slim creator laptop with RTX Studio drivers."),
        ("alienware-m16-r2", "Alienware m16 R2", "Dell", "Laptops", "1799", "High-TGP gaming laptop with advanced cooling."),
        ("lenovo-legion-pro-7", "Lenovo Legion Pro 7", "Lenovo", "Laptops", "2299", "Esports-class laptop with MUX GPU switching."),
        ("asus-proart-p16", "ASUS ProArt P16", "ASUS", "Laptops", "1999", "NVIDIA Studio validation for content pipelines."),
        ("gigabyte-aorus-16x", "Gigabyte AORUS 16X", "Gigabyte", "Laptops", "1699", "Mechanical keyboard gaming chassis."),
        ("hp-envy-17", 'HP ENVY 17"', "HP", "Laptops", "1499", "Large-screen convertible with pen support."),
        ("microsoft-surface-laptop-7", "Microsoft Surface Laptop 7", "Microsoft", "Laptops", "1699", "Snapdragon X Elite efficiency notebook."),
        ("apple-macbook-pro-m4", 'Apple MacBook Pro 14" M4', "Apple", "Laptops", "1999", "Apple silicon laptop with ProMotion mini-LED."),
        ("samsung-galaxy-book4-ultra", "Samsung Galaxy Book4 Ultra", "Samsung", "Laptops", "2399", "Samsung Galaxy ecosystem flagship notebook."),
        ("dynabook-portege-x40", "Dynabook Portégé X40", "Dynabook", "Laptops", "1349", "Business rugged magnesium chassis ultrabook."),
        ("vaio-sx14-r", "VAIO SX14-R", "VAIO", "Laptops", "1549", "Ultra-portable Japanese-built magnesium laptop."),
        ("chuwi-corebook-xpro", "CHUWI CoreBook XPro", "CHUWI", "Laptops", "549", "Budget creator laptop with high-res panel."),
        ("microsoft-surface-go4", "Microsoft Surface Go 4", "Microsoft", "Laptops", "579", "Tiny detachable tablet PC for travel."),
        ("toshiba-dynabook-satellite", "Dynabook Satellite Pro C50", "Dynabook", "Laptops", "699", "Affordable office laptop with numeric keypad."),
    ]
    for i, p in enumerate(laps):
        slug, name, brand, sub, price, desc = p
        pk = "laptop_mac" if "apple" in brand.lower() else "laptop_win"
        items.append((slug, name, brand, sub, price, desc, pk, False))

    # Tablets (8)
    tabs = [
        ("xiaomi-pad-7-pro", "Xiaomi Pad 7 Pro", "Xiaomi", "Tablets", "449", "144Hz LCD slate with desktop-class multitasking."),
        ("honor-magic-pad-2", "HONOR MagicPad 2", "HONOR", "Tablets", "529", "OLED eye-comfort tablet for streaming."),
        ("microsoft-surface-pro-11", "Microsoft Surface Pro 11", "Microsoft", "Tablets", "1199", "Detachable Copilot+ PC tablet."),
        ("samsung-galaxy-tab-s10-fe", "Samsung Galaxy Tab S10 FE", "Samsung", "Tablets", "649", "Fan-edition tablet with long battery."),
        ("realme-pad-3-pro", "realme Pad 3 Pro", "realme", "Tablets", "379", "Dolby Atmos quad-speaker entertainment slate."),
        ("oppo-pad-neo", "OPPO Pad Neo", "OPPO", "Tablets", "329", "Budget stylus-ready Android tablet."),
        ("nokia-t21-tablet", "Nokia T21", "Nokia", "Tablets", "249", "Kid-friendly durable Android tablet."),
        ("tcl-tab-max", "TCL TAB MAX", "TCL", "Tablets", "299", "Budget big-screen tablet for classroom use."),
    ]
    for p in tabs:
        slug, name, brand, sub, price, desc = p
        items.append((slug, name, brand, sub, price, desc, "tablet", False))

    # Audio (10)
    aud = [
        ("beats-studio-pro", "Beats Studio Pro", "Beats", "Audio", "349", "Apple-ecosystem ANC over-ear headphones."),
        ("marshall-major-v", "Marshall Major V", "Marshall", "Audio", "149", "Rock-inspired on-ear wireless headphones."),
        ("audio-technica-m50xbt3", "Audio-Technica ATH-M50xBT3", "Audio-Technica", "Audio", "229", "Studio-tuned Bluetooth headphones."),
        ("bowers-wilkins-px8", "Bowers & Wilkins Px8", "B&W", "Audio", "699", "Carbon-cone luxury travel headphones."),
        ("fiio-m23-dap", "FiiO M23", "FiiO", "Audio", "899", "Portable hi-res player with balanced outputs."),
        ("audeze-maxwell", "Audeze Maxwell", "Audeze", "Audio", "299", "Planar magnetic gaming headset."),
        ("steelseries-arctis-nova-pro", "SteelSeries Arctis Nova Pro Wireless", "SteelSeries", "Audio", "349", "Dual-battery wireless gaming headset."),
        ("hyperx-cloud-iii", "HyperX Cloud III Wireless", "HyperX", "Audio", "169", "Comfort-first gaming headset."),
    ]
    for p in aud:
        slug, name, brand, sub, price, desc = p
        items.append((slug, name, brand, sub, price, desc, "audio_hp", False))

    # TV (6), Gaming (9), Accessories (8), Monitors (7), Storage (5), Cameras (5), Wearables (5), Smart home (5), Misc (9)

    tvs = [
        ("lg-g4-oled-65", "LG G4 OLED 65", "LG", "TV", "2399", "MLA OLED flagship with Filmmaker Mode."),
        ("sony-x95l-65", "Sony X95L 65", "Sony", "TV", "2199", "Mini-LED BRAVIA with cinematic motion."),
        ("vizio-quantum-pro", "Vizio Quantum Pro 75", "Vizio", "TV", "1499", "Bright quantum-color LED TV."),
        ("sharp-aquos-xled", "Sharp AQUOS XLED 65", "Sharp", "TV", "1999", "Hybrid mini-LED LCD flagship."),
        ("xiaomi-tv-s-pro", "Xiaomi TV S Pro 65", "Xiaomi", "TV", "899", "Affordable mini-LED smart TV."),
        ("panasonic-z95a", "Panasonic Z95A OLED 55", "Panasonic", "TV", "1699", "Hollywood tuned OLED processing."),
    ]
    for p in tvs:
        items.append((*p, "tv", False))

    games = [
        ("steam-deck-oled-1tb", "Steam Deck OLED 1TB", "Valve", "Gaming", "649", "Handheld PC gaming with vibrant OLED."),
        ("asus-rog-ally-x", "ASUS ROG Ally X", "ASUS", "Gaming", "799", "Windows handheld with bigger battery."),
        ("lenovo-legion-go", "Lenovo Legion Go", "Lenovo", "Gaming", "699", "Detachable controllers handheld PC."),
        ("sony-dualsense-edge", "Sony DualSense Edge", "Sony", "Gaming", "199", "Pro customizable PS5 controller."),
        ("xbox-elite-3", "Xbox Elite Wireless 3", "Microsoft", "Gaming", "179", "Premium Xbox controller with paddles."),
    ]
    for p in games:
        items.append((*p, "gaming", False))

    acc = [
        ("anker-737-gan-charger", "Anker 737 GaN Charger", "Anker", "Accessories", "99", "High-wattage USB-C laptop charger."),
        ("spigen-tough-armor-iphone", "Spigen Tough Armor (iPhone)", "Spigen", "Accessories", "39", "Dual-layer drop-tested phone case."),
        ("esr-magsafe-wallet", "ESR MagSafe Wallet", "ESR", "Accessories", "29", "Magnetic card wallet with Find My."),
        ("verbatim-type-c-dock", "Verbatim USB-C Mini Dock", "Verbatim", "Accessories", "79", "Travel dock HDMI + USB-A."),
        ("caldigit-ts4", "CalDigit TS4", "CalDigit", "Accessories", "399", "Thunderbolt 4 professional docking station."),
        ("twelve-south-bookarc", "Twelve South BookArc", "Twelve South", "Accessories", "59", "Vertical MacBook stand."),
        ("joby-gorillapod-5k", "JOBY GorillaPod 5K", "JOBY", "Accessories", "149", "Flexible tripod for mirrorless rigs."),
        ("sandisk-pro-cfexpress", "SanDisk PRO CFexpress Type B", "SanDisk", "Accessories", "319", "Fast memory card for pro video."),
    ]
    for p in acc:
        items.append((*p, "accessory", False))

    mons = [
        ("gigabyte-m32uc", "Gigabyte M32UC", "Gigabyte", "Monitors", "699", "32-inch curved 4K gaming monitor."),
        ("asus-proart-pa279cv", "ASUS ProArt PA279CV", "ASUS", "Monitors", "469", "Factory-calibrated 4K creator monitor."),
        ("dell-alienware-aw3423dwf", "Dell Alienware AW3423DWF", "Dell", "Monitors", "1099", "QD-OLED ultrawide gaming panel."),
        ("samsung-odyssey-oled-g9", "Samsung Odyssey OLED G9", "Samsung", "Monitors", "1599", "Super-ultrawide OLED sim cockpit."),
        ("lg-dualup-28mq780", "LG DualUp 28MQ780", "LG", "Monitors", "699", "16:18 stacked dual-purpose workflow monitor."),
        ("eizo-coloredge-cg2700s", "EIZO ColorEdge CG2700S", "EIZO", "Monitors", "2699", "Hardware calibration reference monitor."),
        ("philips-evnia-42m2n8900", "Philips Evnia 42M2N8900", "Philips", "Monitors", "1099", "OLED gaming monitor with Ambilight."),
    ]
    for p in mons:
        items.append((*p, "monitor", False))

    stor = [
        ("samsung-990-pro-4tb", "Samsung 990 PRO 4TB", "Samsung", "Storage", "329", "PCIe 4.0 flagship NVMe SSD."),
        ("sk-hynix-platinum-p41", "SK hynix Platinum P41 2TB", "SK hynix", "Storage", "179", "Efficient PCIe 4.0 SSD."),
        ("teamgroup-mp44l", "Teamgroup MP44L 4TB", "Teamgroup", "Storage", "279", "DRAM-less PCIe 4.0 value SSD."),
        ("lexar-professional-gold", "Lexar Professional GOLD CFexpress", "Lexar", "Storage", "459", "High-speed capture card for 8K bursts."),
        ("lacie-rugged-mini-ssd", "LaCie Rugged Mini SSD 2TB", "LaCie", "Storage", "289", "Rubber-armored field SSD."),
    ]
    for p in stor:
        items.append((*p, "storage", False))

    cams = [
        ("blackmagic-pocket-6k-g3", "Blackmagic Pocket Cinema Camera 6K G3", "Blackmagic", "Cameras", "2595", "Raw cinema workflow compact camera."),
        ("insta360-x4", "Insta360 X4", "Insta360", "Cameras", "499", "8K 360 action camera."),
        ("ricoh-gr-iii-x", "Ricoh GR IIIx", "Ricoh", "Cameras", "1099", "Street photography APS-C compact."),
        ("olympus-om-1-ii", "OM System OM-1 Mark II", "OM System", "Cameras", "2399", "Weather-sealed wildlife mirrorless."),
        ("leica-q3", "Leica Q3", "Leica", "Cameras", "5995", "Full-frame compact with hybrid EVF."),
    ]
    for p in cams:
        items.append((*p, "camera", False))

    wear = [
        ("garmin-forerunner-965", "Garmin Forerunner 965", "Garmin", "Wearables", "599", "AMOLED multisport training watch."),
        ("amazfit-balance-2", "Amazfit Balance 2", "Amazfit", "Wearables", "229", "Sleep and readiness analytics tracker."),
        ("oura-ring-gen4", "Oura Ring Gen4", "Oura", "Wearables", "349", "Sleep and illness trend ring sensor."),
        ("vivo-active-6", "Garmin vívoactive 6", "Garmin", "Wearables", "299", "Daily GPS smartwatch balance."),
        ("zepp-health-band-9", "Zepp Band 9", "Zepp", "Wearables", "99", "Ultra-light fitness band."),
    ]
    for p in wear:
        items.append((*p, "wearable", False))

    smarts = [
        ("aqara-u300-lock", "Aqara Smart Lock U300", "Aqara", "Smart home", "299", "Matter-compatible fingerprint deadbolt."),
        ("tplink-tapo-p125m", "TP-Link Tapo P125M Mini", "TP-Link", "Smart home", "19", "Energy-monitoring Matter smart plug."),
        ("nanoleaf-lines-ultra", "Nanoleaf Lines Ultra", "Nanoleaf", "Smart home", "299", "Backlit modular wall light sculpture."),
        ("eve-energy-outdoor", "Eve Energy Outdoor", "Eve", "Smart home", "49", "HomeKit outdoor smart plug."),
        ("wyze-cam-v4", "Wyze Cam v4", "Wyze", "Smart home", "35", "Budget 2.5K spotlight security camera."),
    ]
    for p in smarts:
        items.append((*p, "smarthome", False))

    misc = [
        ("apple-mac-mini-m4", "Apple Mac mini M4", "Apple", "Desktops", "599", "Compact desktop for studio workloads."),
        ("intel-nuc-13-extreme", "Intel NUC 13 Extreme", "Intel", "Desktops", "1499", "Modular mini workstation tower."),
        ("brother-hl-l8360cdw", "Brother HL-L8360CDW", "Brother", "Printers", "529", "Fast color laser office printer."),
        ("epson-ecotank-et4850", "Epson EcoTank ET-4850", "Epson", "Printers", "599", "Refillable ink tank all-in-one."),
        ("canon-imageclass-mf743", "Canon imageCLASS MF743Cdw", "Canon", "Printers", "449", "SMB color laser MFP."),
        ("tp-link-archer-be800", "TP-Link Archer BE800", "TP-Link", "Networking", "599", "Wi-Fi 7 quad-band router."),
        ("parrot-anafi-ai", "Parrot ANAFI Ai", "Parrot", "Drones", "3999", "4G-connected inspection drone."),
    ]
    for i, p in enumerate(misc):
        pk = (
            "desktop_printer_network"
            if p[3] in ("Desktops", "Printers", "Networking")
            else "camera"
        )
        if p[3] == "Drones":
            pk = "camera"
        featured = i == 0
        items.append((*p, pk, featured))

    assert len(items) == 101, len(items)

    out: list[dict] = []
    for idx, row in enumerate(items):
        slug, name, brand, sub, price, desc, pool_key, featured = row
        url = _pick(pool_key, idx)
        pid = f"elec-exp-{slug}"
        file_name = f"exp-{slug}.jpg"
        out.append(
            {
                "prodId": pid,
                "slug": slug,
                "name": name,
                "brand": brand,
                "category": "Electronics",
                "subcategory": sub,
                "price": price,
                "description": desc,
                "file": file_name,
                "url": url,
                "featured": featured,
            }
        )
    return out
