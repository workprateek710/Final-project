/* eslint-disable no-console */
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
      // try next encoding
    }
  }
  return {};
}

function ensureIds(rows) {
  let changed = false;
  const next = (Array.isArray(rows) ? rows : []).map((row) => {
    if (row && row._id) return row;
    changed = true;
    return { _id: new mongoose.Types.ObjectId(), ...(row || {}) };
  });
  return { changed, rows: next };
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
  const usersCol = mongoose.connection.db.collection("users");
  const users = await usersCol
    .find({}, { projection: { savedAddresses: 1, savedPayments: 1 } })
    .toArray();

  let usersUpdated = 0;
  let addressIdsAdded = 0;
  let paymentIdsAdded = 0;

  for (const user of users) {
    const beforeAddresses = Array.isArray(user.savedAddresses)
      ? user.savedAddresses.filter((row) => !row?._id).length
      : 0;
    const beforePayments = Array.isArray(user.savedPayments)
      ? user.savedPayments.filter((row) => !row?._id).length
      : 0;
    const addresses = ensureIds(user.savedAddresses);
    const payments = ensureIds(user.savedPayments);

    if (!addresses.changed && !payments.changed) continue;

    await usersCol.updateOne(
      { _id: user._id },
      {
        $set: {
          savedAddresses: addresses.rows,
          savedPayments: payments.rows,
        },
      }
    );
    usersUpdated += 1;
    addressIdsAdded += beforeAddresses;
    paymentIdsAdded += beforePayments;
  }

  console.log(
    JSON.stringify(
      {
        usersScanned: users.length,
        usersUpdated,
        addressIdsAdded,
        paymentIdsAdded,
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
