import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lifelink";

async function start() {
  try {
    await connectDB(MONGODB_URI);
  } catch (err) {
    console.error("✗ Could not connect to MongoDB:", err.message);
    console.error("  Start MongoDB and check MONGODB_URI in your .env file.");
    process.exit(1);
  }

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`✓ LifeLink API listening on http://localhost:${PORT}`);
  });
}

start();
