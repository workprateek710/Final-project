/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const TARGET_PURCHASES = 2000;
const TARGET_REVIEWS = 800;

function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx < 1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
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
    const parsed = parseEnv(raw.toString(enc));
    if (Object.keys(parsed).length) return parsed;
  }
  return {};
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRating() {
  const roll = Math.random();
  if (roll < 0.5) return 5;
  if (roll < 0.85) return 4;
  return 3;
}

function randomRecentDate() {
  const daysAgo = randomInt(0, 180);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59), 0);
  return date;
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

  const users = await usersCol.find({}, { projection: { email: 1 } }).toArray();
  const products = await productsCol.find({}, { projection: { prodId: 1 } }).toArray();
  const emails = users.map((user) => String(user.email || "")).filter(Boolean);
  const prodIds = products.map((product) => String(product.prodId || "")).filter(Boolean);
  if (!emails.length || !prodIds.length) throw new Error("Need users and products before amplifying activity.");

  const currentPurchases = await purchasesCol.countDocuments({});
  const purchaseGap = Math.max(0, TARGET_PURCHASES - currentPurchases);
  const purchaseDocs = [];
  for (let i = 0; i < purchaseGap; i += 1) {
    const createdAt = randomRecentDate();
    purchaseDocs.push({
      userId: pick(emails),
      prodId: pick(prodIds),
      rating: weightedRating(),
      createdAt,
      updatedAt: createdAt,
    });
  }
  if (purchaseDocs.length) await purchasesCol.insertMany(purchaseDocs, { ordered: false });

  const currentReviews = await ratingsCol.countDocuments({});
  const reviewGap = Math.max(0, TARGET_REVIEWS - currentReviews);
  const existingPairs = new Set(
    (await ratingsCol.find({}, { projection: { userId: 1, prodId: 1 } }).toArray()).map(
      (row) => `${row.userId}::${row.prodId}`
    )
  );
  const reviewDocs = [];
  let attempts = 0;
  while (reviewDocs.length < reviewGap && attempts < reviewGap * 50) {
    attempts += 1;
    const userId = pick(emails);
    const prodId = pick(prodIds);
    const key = `${userId}::${prodId}`;
    if (existingPairs.has(key)) continue;
    existingPairs.add(key);
    const createdAt = randomRecentDate();
    reviewDocs.push({
      userId,
      prodId,
      rating: weightedRating(),
      createdAt,
      updatedAt: createdAt,
    });
  }
  if (reviewDocs.length) await ratingsCol.insertMany(reviewDocs, { ordered: false });

  const sync = await syncProductMetrics(db);
  const finalPurchases = await purchasesCol.countDocuments({});
  const finalReviews = await ratingsCol.countDocuments({});

  console.log(
    JSON.stringify(
      {
        users: emails.length,
        products: prodIds.length,
        purchasesBefore: currentPurchases,
        purchasesAdded: purchaseDocs.length,
        purchasesAfter: finalPurchases,
        reviewsBefore: currentReviews,
        reviewsAdded: reviewDocs.length,
        reviewsAfter: finalReviews,
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
