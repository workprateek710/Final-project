/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const DEMO_PASSWORD = "12345678";

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
  const hash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const result = await mongoose.connection.db.collection("users").updateMany(
    { email: /@gmail\.com$/ },
    { $set: { passwordHash: hash, updatedAt: new Date() } }
  );

  console.log(
    JSON.stringify(
      {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        password: DEMO_PASSWORD,
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
