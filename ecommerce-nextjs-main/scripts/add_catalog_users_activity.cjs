/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const USER_COUNT = 100;
const PASSWORD = "12345678";
const PRODUCT_PREFIX = "extra-2026";
const SUBCATEGORIES = [
  "Phones",
  "Laptops",
  "Tablets",
  "Audio",
  "TV",
  "Gaming",
  "Accessories",
  "Monitors",
  "Storage",
  "Cameras",
  "Wearables",
  "Smart home",
  "Networking",
  "Drones",
  "Printers",
];
const STREETS = ["Maple Ave", "Cedar St", "Oak Drive", "Pine Lane", "Sunset Blvd", "Lakeview Rd", "Mission St", "Harbor Way"];
const CITIES = ["Los Angeles", "San Diego", "San Jose", "Sacramento", "Irvine", "Fresno", "Long Beach", "Pasadena"];
const CARD_TYPES = ["visa", "mastercard", "amex", "discover"];

const PRODUCTS = [
  ["Samsung Galaxy Z Fold 6", "Samsung", "Phones", 1899, "Foldable flagship phone with a large inner AMOLED display."],
  ["Samsung Galaxy Z Flip 6", "Samsung", "Phones", 1099, "Compact foldable phone with improved camera and cover screen."],
  ["Apple iPhone 16 Pro", "Apple", "Phones", 999, "Pro iPhone with titanium build and advanced camera controls."],
  ["Apple iPhone 16", "Apple", "Phones", 799, "Everyday iPhone with fast chip, USB-C, and strong battery life."],
  ["Google Pixel 9 Pro", "Google", "Phones", 999, "AI-focused Android flagship with excellent computational photography."],
  ["Google Pixel 9", "Google", "Phones", 799, "Clean Android phone with Tensor performance and camera features."],
  ["Samsung Galaxy S24 FE", "Samsung", "Phones", 649, "Fan Edition Galaxy phone with flagship-inspired features."],
  ["Motorola Razr Plus 2024", "Motorola", "Phones", 999, "Flip phone with large outer display and pocketable design."],
  ["OnePlus Open", "OnePlus", "Phones", 1699, "Thin foldable Android phone with multitasking display."],
  ["Sony Xperia 1 VI", "Sony", "Phones", 1399, "Creator-focused smartphone with pro camera controls."],
  ["Apple MacBook Pro 14 M4", "Apple", "Laptops", 1599, "Compact pro laptop for creative and development workflows."],
  ["Apple MacBook Pro 16 M4 Max", "Apple", "Laptops", 3499, "High-performance laptop with large Liquid Retina XDR display."],
  ["Dell XPS 13 Plus", "Dell", "Laptops", 1299, "Premium ultraportable laptop with edge-to-edge keyboard deck."],
  ["Lenovo Yoga 9i 2-in-1", "Lenovo", "Laptops", 1399, "Convertible OLED laptop for work, notes, and media."],
  ["ASUS Zenbook Duo", "ASUS", "Laptops", 1699, "Dual-screen productivity laptop with detachable keyboard."],
  ["Microsoft Surface Pro 11", "Microsoft", "Laptops", 1199, "Copilot+ detachable PC with OLED display option."],
  ["HP Omen Transcend 14", "HP", "Laptops", 1499, "Portable gaming laptop with OLED display and RTX graphics."],
  ["Alienware m16 R2", "Alienware", "Laptops", 1899, "Gaming laptop with high-refresh display and advanced cooling."],
  ["Acer Predator Helios Neo 16", "Acer", "Laptops", 1399, "Performance gaming notebook for esports and AAA games."],
  ["Lenovo Legion 7i Gen 9", "Lenovo", "Laptops", 1999, "Premium gaming laptop with strong thermal design."],
  ["Apple iPad mini 7", "Apple", "Tablets", 499, "Compact tablet for reading, notes, travel, and gaming."],
  ["Apple iPad 10th Gen", "Apple", "Tablets", 349, "Everyday iPad with colorful design and USB-C."],
  ["Samsung Galaxy Tab S10 Ultra", "Samsung", "Tablets", 1199, "Large AMOLED tablet with S Pen and multitasking features."],
  ["Samsung Galaxy Tab A9 Plus", "Samsung", "Tablets", 269, "Affordable Android tablet for streaming and schoolwork."],
  ["Microsoft Surface Go 4", "Microsoft", "Tablets", 579, "Compact Windows tablet for lightweight productivity."],
  ["Amazon Kindle Scribe", "Amazon", "Tablets", 339, "Large E Ink reader with note-taking support."],
  ["reMarkable Paper Pro", "reMarkable", "Tablets", 579, "Color paper tablet for focused notes and documents."],
  ["Lenovo Legion Tab", "Lenovo", "Tablets", 499, "Compact Android gaming tablet with fast display."],
  ["Google Pixel Tablet", "Google", "Tablets", 499, "Android tablet with charging speaker dock."],
  ["OnePlus Pad 2", "OnePlus", "Tablets", 549, "Fast Android tablet with productivity accessories."],
  ["Apple AirPods Pro 2", "Apple", "Audio", 249, "Wireless earbuds with adaptive noise cancellation."],
  ["Sony WF-1000XM5", "Sony", "Audio", 299, "Premium noise-canceling true wireless earbuds."],
  ["Bose QuietComfort Ultra Headphones", "Bose", "Audio", 429, "Noise-canceling headphones with immersive audio."],
  ["Sonos Arc Ultra", "Sonos", "Audio", 999, "Premium soundbar for home theater setups."],
  ["Sonos Sub Mini", "Sonos", "Audio", 429, "Compact wireless subwoofer for Sonos speakers."],
  ["Marshall Acton III", "Marshall", "Audio", 279, "Retro Bluetooth speaker with room-filling sound."],
  ["Beats Studio Pro", "Beats", "Audio", 349, "Over-ear headphones with ANC and Apple ecosystem support."],
  ["JBL Charge 5", "JBL", "Audio", 179, "Portable waterproof speaker with power bank feature."],
  ["Rode Wireless Pro", "Rode", "Audio", 399, "Wireless microphone kit for creators and interviews."],
  ["Blue Yeti X", "Logitech", "Audio", 169, "USB microphone for streaming, meetings, and podcasts."],
  ["LG C4 OLED 65", "LG", "TV", 2499, "OLED TV with deep blacks and high-refresh gaming support."],
  ["Samsung The Frame 55", "Samsung", "TV", 1499, "Lifestyle 4K TV with art mode and slim wall mount."],
  ["Sony BRAVIA 9 Mini LED", "Sony", "TV", 2999, "High-brightness mini-LED TV for movies and sports."],
  ["TCL QM7 75", "TCL", "TV", 1499, "Large 4K mini-LED TV with strong gaming features."],
  ["Hisense U7N 65", "Hisense", "TV", 899, "Value-focused mini-LED TV with Google TV."],
  ["Roku Pro Series 55", "Roku", "TV", 899, "Smart TV with Roku OS and local dimming."],
  ["Samsung QN90D Neo QLED", "Samsung", "TV", 2199, "Bright 4K mini-LED TV for daylight rooms."],
  ["LG StanbyME Go", "LG", "TV", 999, "Portable touchscreen entertainment display in a case."],
  ["Amazon Fire TV Omni QLED", "Amazon", "TV", 799, "QLED Fire TV with Alexa integration."],
  ["Sony BRAVIA Theater Quad", "Sony", "TV", 2499, "Wireless home theater speaker system for BRAVIA TVs."],
  ["Nintendo Switch 2", "Nintendo", "Gaming", 449, "Next-generation hybrid Nintendo console."],
  ["PlayStation Portal", "Sony", "Gaming", 199, "Remote player for PS5 games over Wi-Fi."],
  ["Xbox Series S 1TB", "Microsoft", "Gaming", 349, "Compact digital Xbox console with expanded storage."],
  ["ASUS ROG Ally X", "ASUS", "Gaming", 799, "Windows handheld gaming PC with larger battery."],
  ["Lenovo Legion Go", "Lenovo", "Gaming", 699, "Handheld gaming PC with detachable controllers."],
  ["Backbone One USB-C", "Backbone", "Gaming", 99, "Mobile controller for USB-C phones."],
  ["SteelSeries Arctis Nova Pro", "SteelSeries", "Gaming", 349, "Wireless gaming headset with base station."],
  ["Razer BlackWidow V4 Pro", "Razer", "Gaming", 229, "Mechanical gaming keyboard with command dial."],
  ["Corsair K70 Max", "Corsair", "Gaming", 229, "Adjustable mechanical keyboard for gaming."],
  ["Logitech G Pro X Superlight 2", "Logitech", "Gaming", 159, "Lightweight wireless esports mouse."],
  ["Apple Magic Keyboard USB-C", "Apple", "Accessories", 99, "Low-profile wireless keyboard with USB-C charging."],
  ["Logitech MX Keys S", "Logitech", "Accessories", 109, "Wireless productivity keyboard with smart illumination."],
  ["Apple Magic Trackpad USB-C", "Apple", "Accessories", 129, "Multi-touch trackpad for Mac desktops and laptops."],
  ["CalDigit TS4 Dock", "CalDigit", "Accessories", 399, "Thunderbolt 4 dock with 18 ports."],
  ["Anker 737 Charger", "Anker", "Accessories", 109, "Compact 120W GaN charger for laptops and phones."],
  ["Nomad Stand One Max", "Nomad", "Accessories", 180, "Premium MagSafe charging stand for Apple devices."],
  ["Tile Pro Tracker", "Tile", "Accessories", 34, "Bluetooth item tracker with replaceable battery."],
  ["Apple AirTag 4 Pack", "Apple", "Accessories", 99, "Find My item trackers for bags and keys."],
  ["Elgato Key Light MK.2", "Elgato", "Accessories", 199, "Adjustable studio light for streaming setups."],
  ["Wacom One 13 Touch", "Wacom", "Accessories", 599, "Pen display for drawing and creative work."],
  ["Dell UltraSharp U2724DE", "Dell", "Monitors", 649, "27-inch QHD monitor with Thunderbolt hub."],
  ["Apple Studio Display", "Apple", "Monitors", 1599, "5K Retina display with camera and speakers."],
  ["Samsung Odyssey OLED G9", "Samsung", "Monitors", 1799, "Ultra-wide OLED gaming monitor with 240Hz refresh."],
  ["LG UltraFine 5K", "LG", "Monitors", 1299, "5K monitor built for Mac productivity."],
  ["ASUS ProArt PA279CRV", "ASUS", "Monitors", 469, "Color-accurate 4K monitor for creators."],
  ["BenQ MOBIUZ EX3210U", "BenQ", "Monitors", 899, "32-inch 4K gaming monitor with HDMI 2.1."],
  ["Acer Nitro XV275K", "Acer", "Monitors", 549, "4K mini-LED gaming monitor with HDR."],
  ["ViewSonic ColorPro VP2786", "ViewSonic", "Monitors", 999, "Professional monitor with hardware calibration."],
  ["HP E45c G5 Curved", "HP", "Monitors", 1099, "45-inch super ultrawide monitor for multitasking."],
  ["Alienware AW3423DWF", "Alienware", "Monitors", 999, "QD-OLED ultrawide gaming monitor."],
  ["Samsung 990 EVO 2TB", "Samsung", "Storage", 149, "Efficient NVMe SSD for laptops and desktops."],
  ["Crucial T705 2TB", "Crucial", "Storage", 279, "PCIe 5.0 NVMe SSD with extreme throughput."],
  ["WD My Passport 5TB", "Western Digital", "Storage", 129, "Portable hard drive for backups and media."],
  ["LaCie Rugged SSD Pro 1TB", "LaCie", "Storage", 319, "Thunderbolt rugged SSD for field work."],
  ["Synology DS224+", "Synology", "Storage", 299, "Two-bay NAS for home storage and backups."],
  ["SanDisk Professional G-Drive 4TB", "SanDisk", "Storage", 219, "Desktop external drive for creative projects."],
  ["Kingston Canvas React Plus 256GB", "Kingston", "Storage", 99, "Fast SD card for cameras and video."],
  ["Seagate Expansion Desktop 12TB", "Seagate", "Storage", 249, "High-capacity external desktop storage."],
  ["Sabrent Rocket 4 Plus 4TB", "Sabrent", "Storage", 399, "High-capacity PCIe 4.0 NVMe SSD."],
  ["Samsung PRO Plus microSD 512GB", "Samsung", "Storage", 49, "Fast microSD card for cameras and handhelds."],
  ["Sony ZV-E10 II", "Sony", "Cameras", 999, "Compact APS-C camera for vlogging and creators."],
  ["Canon PowerShot V10", "Canon", "Cameras", 429, "Pocket vlogging camera with built-in stand."],
  ["Nikon Z6 III", "Nikon", "Cameras", 2499, "Full-frame hybrid camera with fast sensor readout."],
  ["DJI Action 5 Pro", "DJI", "Cameras", 349, "Rugged action camera with long battery life."],
  ["Insta360 X4", "Insta360", "Cameras", 499, "8K 360-degree action camera."],
  ["Fujifilm X100VI", "Fujifilm", "Cameras", 1599, "Premium compact camera with hybrid viewfinder."],
  ["Panasonic GH7", "Panasonic", "Cameras", 2199, "Micro Four Thirds hybrid camera for video creators."],
  ["Leica D-Lux 8", "Leica", "Cameras", 1595, "Premium compact camera with classic controls."],
  ["GoPro MAX", "GoPro", "Cameras", 499, "Waterproof 360 action camera."],
  ["DJI RS 4 Gimbal", "DJI", "Cameras", 549, "Camera stabilizer for mirrorless video workflows."],
];

function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\u0000/g, "").replace(/^\uFEFF/, "").trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx < 1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath);
  for (const enc of ["utf8", "utf16le"]) {
    try {
      const parsed = parseEnv(raw.toString(enc));
      if (Object.keys(parsed).length) return parsed;
    } catch {
      // try next encoding
    }
  }
  return {};
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function indexToName(idx) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let x = idx;
  let out = "";
  for (let i = 0; i < 4; i += 1) {
    out = alphabet[x % 26] + out;
    x = Math.floor(x / 26);
  }
  return out;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickMany(arr, count) {
  return shuffle(arr).slice(0, count);
}

function weightedRating() {
  const roll = Math.random();
  if (roll < 0.48) return 5;
  if (roll < 0.85) return 4;
  if (roll < 0.97) return 3;
  return 2;
}

function randomRecentDate() {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, 120));
  date.setHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59), 0);
  return date;
}

function makeAddress(name) {
  return {
    label: "Home",
    name,
    address: `${randomInt(100, 9999)} ${pick(STREETS)}`,
    city: pick(CITIES),
    zip: String(randomInt(90001, 96162)),
    country: "USA",
  };
}

function makePayment(name) {
  const cardType = pick(CARD_TYPES);
  const last4 = String(randomInt(1000, 9999));
  return {
    label: `${cardType.toUpperCase()} ${last4}`,
    cardholderName: name,
    cardLast4: last4,
    expiry: `${String(randomInt(1, 12)).padStart(2, "0")}/${randomInt(27, 31)}`,
    cardType,
  };
}

async function syncProductMetrics(db) {
  const productsCol = db.collection("products");
  const ratingsCol = db.collection("productratings");
  const stats = await ratingsCol
    .aggregate([
      {
        $group: {
          _id: "$prodId",
          reviews: { $sum: 1 },
          ratingAvg: { $avg: "$rating" },
        },
      },
    ])
    .toArray();
  const byProd = new Map(
    stats.map((row) => [
      String(row._id),
      {
        reviews: Number(row.reviews) || 0,
        ratingAvg: Number(Number(row.ratingAvg || 0).toFixed(2)),
      },
    ])
  );
  const products = await productsCol.find({}, { projection: { _id: 1, prodId: 1 } }).toArray();
  if (!products.length) return { productsMatched: 0, productsModified: 0 };
  const result = await productsCol.bulkWrite(
    products.map((product) => {
      const stat = byProd.get(String(product.prodId || ""));
      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              reviews: stat?.reviews ?? 0,
              ratingAvg: stat?.ratingAvg ?? 0,
            },
          },
        },
      };
    }),
    { ordered: false }
  );
  return {
    productsMatched: result.matchedCount,
    productsModified: result.modifiedCount,
  };
}

async function main() {
  const root = path.resolve(__dirname, "..");
  const merged = {
    ...loadEnvFile(path.join(root, ".env")),
    ...loadEnvFile(path.join(root, ".env.local")),
    ...process.env,
  };
  const mongoUri = (merged.MONGO_URI || merged.MONGODB_URI || "").trim();
  if (!mongoUri) throw new Error("Missing MONGO_URI / MONGODB_URI");

  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const usersCol = db.collection("users");
  const productsCol = db.collection("products");
  const purchasesCol = db.collection("purchases");
  const ratingsCol = db.collection("productratings");

  const now = new Date();
  const productDocs = PRODUCTS.map(([name, brand, subcategory, price, description], index) => {
    const prodId = `${PRODUCT_PREFIX}-${String(index + 1).padStart(3, "0")}`;
    const slug = slugify(`${name}-${PRODUCT_PREFIX}`);
    return {
      prodId,
      slug,
      imgSrc: `https://picsum.photos/seed/${prodId}/800/800`,
      fileKey: `remote:picsum:${prodId}`,
      name,
      brand,
      category: "Electronics",
      subcategory,
      price: String(price),
      description,
      ratingAvg: 0,
      reviews: 0,
      stock: randomInt(8, 140),
      featured: index % 13 === 0,
      createdAt: now,
      updatedAt: now,
    };
  });

  const existingProdIds = new Set(await productsCol.distinct("prodId"));
  const existingSlugs = new Set(await productsCol.distinct("slug"));
  const productsToInsert = productDocs.filter((product) => {
    if (existingProdIds.has(product.prodId) || existingSlugs.has(product.slug)) return false;
    existingProdIds.add(product.prodId);
    existingSlugs.add(product.slug);
    return true;
  });
  if (productsToInsert.length) {
    await productsCol.insertMany(productsToInsert, { ordered: false });
  }

  const existingEmails = new Set(await usersCol.distinct("email"));
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const usersToInsert = [];
  let idx = 0;
  while (usersToInsert.length < USER_COUNT) {
    const name = indexToName(idx);
    const email = `${name}@gmail.com`;
    idx += 1;
    if (existingEmails.has(email)) continue;
    existingEmails.add(email);
    usersToInsert.push({
      email,
      name,
      passwordHash,
      phone: "",
      bio: "",
      address: "",
      city: "",
      zip: "",
      country: "",
      savedAddresses: [makeAddress(name)],
      savedPayments: [makePayment(name)],
      createdAt: now,
      updatedAt: now,
    });
  }
  await usersCol.insertMany(usersToInsert, { ordered: false });

  const allProdIds = (await productsCol.find({}, { projection: { prodId: 1, subcategory: 1 } }).toArray())
    .map((product) => String(product.prodId || ""))
    .filter(Boolean);
  const newProdIds = productDocs.map((product) => product.prodId);
  const activityPool = [...newProdIds, ...pickMany(allProdIds, Math.min(120, allProdIds.length))];
  const purchaseDocs = [];
  const ratingDocs = [];
  const ratingPairs = new Set(
    (await ratingsCol.find({}, { projection: { userId: 1, prodId: 1 } }).toArray()).map(
      (row) => `${row.userId}::${row.prodId}`
    )
  );

  for (const user of usersToInsert) {
    const purchased = pickMany(activityPool, randomInt(8, 18));
    for (const prodId of purchased) {
      const createdAt = randomRecentDate();
      purchaseDocs.push({
        userId: user.email,
        prodId,
        createdAt,
        updatedAt: createdAt,
      });
    }
    const reviewed = pickMany(purchased, randomInt(2, Math.min(7, purchased.length)));
    for (const prodId of reviewed) {
      const key = `${user.email}::${prodId}`;
      if (ratingPairs.has(key)) continue;
      ratingPairs.add(key);
      const createdAt = randomRecentDate();
      ratingDocs.push({
        userId: user.email,
        prodId,
        rating: weightedRating(),
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  if (purchaseDocs.length) await purchasesCol.insertMany(purchaseDocs, { ordered: false });
  if (ratingDocs.length) await ratingsCol.insertMany(ratingDocs, { ordered: false });
  const sync = await syncProductMetrics(db);

  const categoryCounts = await purchasesCol
    .aggregate([
      { $match: { userId: { $in: usersToInsert.map((user) => user.email) } } },
      { $lookup: { from: "products", localField: "prodId", foreignField: "prodId", as: "product" } },
      { $unwind: "$product" },
      { $group: { _id: "$product.subcategory", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();

  console.log(
    JSON.stringify(
      {
        productsInserted: productsToInsert.length,
        usersInserted: usersToInsert.length,
        purchasesInserted: purchaseDocs.length,
        reviewsInserted: ratingDocs.length,
        password: PASSWORD,
        purchaseSubcategories: categoryCounts,
        ...sync,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });
