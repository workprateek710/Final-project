/* eslint-disable no-console */
/**
 * Inserts N random purchase rows (userId + prodId) for demo/analytics.
 * Run from repo: node scripts/add_random_purchases.cjs
 * Optional: PURCHASE_SEED_COUNT=35 (default 35)
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

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
      /* try next */
    }
  }
  return {};
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const count = Math.min(500, Math.max(1, Number(process.env.PURCHASE_SEED_COUNT) || 35));

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

  const users = await db.collection("users").find({}, { projection: { email: 1 } }).toArray();
  const emails = users.map((u) => String(u.email ?? "").trim()).filter(Boolean);
  const products = await db.collection("products").find({}, { projection: { prodId: 1 } }).toArray();
  const prodIds = products.map((p) => String(p.prodId ?? "").trim()).filter(Boolean);

  if (!emails.length) throw new Error("No users in database");
  if (!prodIds.length) throw new Error("No products in database");

  const now = new Date();
  const docs = [];
  for (let i = 0; i < count; i++) {
    docs.push({
      userId: pick(emails),
      prodId: pick(prodIds),
      createdAt: now,
      updatedAt: now,
    });
  }

  const res = await db.collection("purchases").insertMany(docs);
  console.log(JSON.stringify({ inserted: res.insertedCount, requested: count }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
