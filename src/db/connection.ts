// api/src/db.ts
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bun_starter";

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");
  //logger.info("MongoDB connected");
}

// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myapp";

// let isConnected = false;

// export async function connectDB(): Promise<void> {
//   if (isConnected) {
//     console.log("MongoDB already connected");
//     return;
//   }

//   try {
//     const db = await mongoose.connect(MONGODB_URI);
//     isConnected = db.connections[0].readyState === 1;
//     console.log("MongoDB connected successfully");
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//     throw error;
//   }
// }

// export async function disconnectDB(): Promise<void> {
//   if (!isConnected) {
//     return;
//   }

//   try {
//     await mongoose.disconnect();
//     isConnected = false;
//     console.log("MongoDB disconnected");
//   } catch (error) {
//     console.error("MongoDB disconnect error:", error);
//     throw error;
//   }
// }