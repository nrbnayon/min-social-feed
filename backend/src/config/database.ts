import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

// Setup mongoose lifecycle event listeners
mongoose.connection.on("connected", () => {
  logger.info("MongoDB connected successfully");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Waiting for reconnection...");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected successfully");
});

/**
 * Connect to MongoDB with automatic retry and exponential backoff
 */
export const connectDatabase = async (maxRetries = 10, delayMs = 2000): Promise<void> => {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      logger.info(`Connecting to MongoDB... (Attempt ${attempt}/${maxRetries})`);
      
      await mongoose.connect(env.databaseUrl, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      return;
    } catch (error) {
      logger.error(`Failed to connect to MongoDB on attempt ${attempt}/${maxRetries}:`, error);

      if (attempt >= maxRetries) {
        throw new Error(`Unable to establish database connection after ${maxRetries} attempts.`);
      }

      const backoffDelay = Math.min(delayMs * Math.pow(1.5, attempt - 1), 30000);
      logger.warn(`Retrying database connection in ${(backoffDelay / 1000).toFixed(1)}s...`);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }
};
