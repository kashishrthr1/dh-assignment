import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/digital_heroes";

  try {
    await mongoose.connect(uri);
    console.log(`[Database] Connected to MongoDB at ${uri.replace(/\/\/.*@/, "//<credentials>@")}`);
  } catch (err) {
    console.error("[Database] Connection failed:", err);
    // Don't crash immediately in dev to allow tests to run with mocks
  }
}
