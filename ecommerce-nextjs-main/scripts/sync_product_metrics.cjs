/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

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
      const parsed = parseEnv(raw.toString(enc));
      if (Object.keys(parsed).length) return parsed;
    } catch {
      // ignore
    }
  }
  return {};
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
  const productsCol = db.collection("products");
  const ratingsCol = db.collection("productratings");

  const rows = await ratingsCol
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

  const statsByProd = new Map(
    rows.map((r) => [
      String(r._id),
      {
        reviews: Number(r.reviews) || 0,
        ratingAvg: Number(Number(r.ratingAvg || 0).toFixed(2)),
      },
    ])
  );

  const products = await productsCol.find({}, { projection: { _id: 1, prodId: 1 } }).toArray();
  if (!products.length) {
    console.log("No products found.");
    return;
  }

  const bulk = products.map((p) => {
    const pid = String(p.prodId || "");
    const stat = statsByProd.get(pid);
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
  });

  const result = await productsCol.bulkWrite(bulk, { ordered: false });
  const totalReviews = rows.reduce((sum, r) => sum + (Number(r.reviews) || 0), 0);

  console.log(
    JSON.stringify(
      {
        productsMatched: result.matchedCount,
        productsModified: result.modifiedCount,
        totalReviewsFromRatingsCollection: totalReviews,
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
