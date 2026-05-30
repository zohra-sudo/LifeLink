import mongoose from "mongoose";

/**
 * Connect to MongoDB. Throws on failure so the caller (server.js) can decide
 * whether to exit. Tests inject their own in-memory URI.
 */
export async function connectDB(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`✓ MongoDB connected → ${mongoose.connection.name}`);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
