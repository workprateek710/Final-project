/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const FIRST_NAMES = [
  "Avery",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Quinn",
  "Jamie",
  "Parker",
  "Reese",
];
const LAST_NAMES = [
  "Johnson",
  "Lee",
  "Patel",
  "Garcia",
  "Brown",
  "Smith",
  "Kim",
  "Nguyen",
  "Davis",
  "Wilson",
];
const STREETS = [
  "Maple Ave",
  "Cedar St",
  "Oak Drive",
  "Pine Lane",
  "Sunset Blvd",
  "Lakeview Rd",
  "Hillcrest Way",
  "Riverside Dr",
];
const CITIES = [
  "Los Angeles",
  "San Diego",
  "San Jose",
  "Sacramento",
  "Irvine",
  "Fresno",
  "Long Beach",
  "Anaheim",
];
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
    const parsed = parseEnv(raw.toString(enc));
    if (Object.keys(parsed).length) return parsed;
  }
  return {};
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeName(email) {
  const prefix = String(email || "customer").split("@")[0];
  return `${prefix.charAt(0).toUpperCase()}${prefix.slice(1)}`;
}

function makeAddress(email) {
  const name = makeName(email);
  const city = pick(CITIES);
  return {
    label: "Home",
    name,
    address: `${randomInt(100, 9999)} ${pick(STREETS)}`,
    city,
    zip: String(randomInt(90001, 96162)),
    country: "USA",
  };
}

function makePayment(email) {
  const cardType = pick(CARD_TYPES);
  const cardholderName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const last4 = String(randomInt(1000, 9999));
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const year = String(randomInt(27, 31));
  return {
    label: `${cardType.toUpperCase()} ${last4}`,
    cardholderName: cardholderName || makeName(email),
    cardLast4: last4,
    expiry: `${month}/${year}`,
    cardType,
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
  const usersCol = mongoose.connection.db.collection("users");
  const users = await usersCol.find({}, { projection: { email: 1, savedAddresses: 1, savedPayments: 1 } }).toArray();

  let addressUpdates = 0;
  let paymentUpdates = 0;
  for (const user of users) {
    const update = { $set: { updatedAt: new Date() } };
    if (!Array.isArray(user.savedAddresses) || user.savedAddresses.length === 0) {
      update.$set.savedAddresses = [makeAddress(user.email)];
      addressUpdates += 1;
    }
    if (!Array.isArray(user.savedPayments) || user.savedPayments.length === 0) {
      update.$set.savedPayments = [makePayment(user.email)];
      paymentUpdates += 1;
    }

    if (Object.keys(update.$set).length > 1) {
      await usersCol.updateOne({ _id: user._id }, update);
    }
  }

  console.log(
    JSON.stringify(
      {
        usersReviewed: users.length,
        usersGivenAddresses: addressUpdates,
        usersGivenPayments: paymentUpdates,
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
