import mongoose from "mongoose";

export const connectMongoDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  const uri = process.env.MONGO_URI ?? process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGO_URI (or MONGODB_URI) for MongoDB connection.");
  }
  await mongoose.connect(uri);
};
