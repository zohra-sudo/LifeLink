import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod;

/** Boot an isolated in-memory MongoDB and connect mongoose to it. */
export async function startTestDB() {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-secret";
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

/** Drop everything and tear down. */
export async function stopTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

/** Clear all collections between tests for isolation. */
export async function clearDB() {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}
