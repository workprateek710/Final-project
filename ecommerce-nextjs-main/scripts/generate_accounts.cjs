/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const TARGET_NEW_USERS = 97;
const PASSWORD = "12345678";
const FIRST_NAMES = ["Avery", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Jamie"];
const LAST_NAMES = ["Johnson", "Lee", "Patel", "Garcia", "Brown", "Smith", "Kim", "Nguyen"];
const STREETS = ["Maple Ave", "Cedar St", "Oak Drive", "Pine Lane", "Sunset Blvd", "Lakeview Rd"];
const CITIES = ["Los Angeles", "San Diego", "San Jose", "Sacramento", "Irvine", "Fresno"];
const CARD_TYPES = ["visa", "mastercard", "amex"];

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
    try {
      const text = raw.toString(enc);
      const parsed = parseEnv(text);
      if (Object.keys(parsed).length > 0) return parsed;
    } catch {
      // try next encoding
    }
  }
  return {};
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

function makePayment() {
  const cardType = pick(CARD_TYPES);
  const last4 = String(randomInt(1000, 9999));
  return {
    label: `${cardType.toUpperCase()} ${last4}`,
    cardholderName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    cardLast4: last4,
    expiry: `${String(randomInt(1, 12)).padStart(2, "0")}/${randomInt(27, 31)}`,
    cardType,
  };
}

function pickMany(arr, count) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

async function main() {
  const root = path.resolve(__dirname, "..");
  const envLocal = loadEnvFile(path.join(root, ".env.local"));
  const env = loadEnvFile(path.join(root, ".env"));
  const merged = { ...env, ...envLocal, ...process.env };
  const mongoUri = (merged.MONGO_URI || merged.MONGODB_URI || "").trim();

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI / MONGODB_URI in env.");
  }

  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  const usersCol = db.collection("users");
  const purchasesCol = db.collection("purchases");
  const ratingsCol = db.collection("productratings");
  const productsCol = db.collection("products");

  const existingEmails = new Set(await usersCol.distinct("email"));
  const productRows = await productsCol.find({}, { projection: { prodId: 1 } }).toArray();
  const prodIds = productRows.map((p) => String(p.prodId)).filter(Boolean);
  if (prodIds.length < 5) {
    throw new Error("Need products in DB before generating purchases/reviews.");
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const newUsers = [];
  let idx = 0;
  while (newUsers.length < TARGET_NEW_USERS) {
    const name = indexToName(idx);
    const email = `${name}@gmail.com`;
    idx += 1;
    if (existingEmails.has(email)) continue;
    existingEmails.add(email);
    const now = new Date();
    newUsers.push({
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
      savedPayments: [makePayment()],
      createdAt: now,
      updatedAt: now,
    });
  }

  await usersCol.insertMany(newUsers);

  const purchaseDocs = [];
  const reviewDocs = [];
  for (const user of newUsers) {
    const purchaseCount = randomInt(2, 6);
    const purchased = pickMany(prodIds, purchaseCount);
    const now = new Date();
    for (const pid of purchased) {
      purchaseDocs.push({
        userId: user.email,
        prodId: pid,
        rating: randomInt(3, 5),
        createdAt: now,
        updatedAt: now,
      });
    }

    const reviewCount = randomInt(1, Math.min(4, purchased.length));
    const reviewed = pickMany(purchased, reviewCount);
    for (const pid of reviewed) {
      reviewDocs.push({
        userId: user.email,
        prodId: pid,
        rating: randomInt(3, 5),
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  if (purchaseDocs.length) await purchasesCol.insertMany(purchaseDocs);
  if (reviewDocs.length) await ratingsCol.insertMany(reviewDocs);

  // Keep product cards/detail review counters consistent with ProductRating rows.
  const ratingStats = await ratingsCol
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
    ratingStats.map((r) => [
      String(r._id),
      {
        reviews: Number(r.reviews) || 0,
        ratingAvg: Number(Number(r.ratingAvg || 0).toFixed(2)),
      },
    ])
  );
  const allProducts = await productsCol.find({}, { projection: { _id: 1, prodId: 1 } }).toArray();
  if (allProducts.length) {
    await productsCol.bulkWrite(
      allProducts.map((p) => {
        const stat = byProd.get(String(p.prodId || ""));
        return {
          updateOne: {
            filter: { _id: p._id },
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
  }

  console.log(
    JSON.stringify(
      {
        createdUsers: newUsers.length,
        createdPurchases: purchaseDocs.length,
        createdReviews: reviewDocs.length,
        password: PASSWORD,
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });
