import type { Server } from "node:http";
import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import mongoose from "mongoose";

let server: Server | null = null;
let isShuttingDown = false;

const startServer = async (maxRetries = 10, retryDelayMs = 3000): Promise<void> => {
  let attempt = 0;

  while (attempt < maxRetries && !isShuttingDown) {
    try {
      attempt++;
      logger.info(`Starting API server... (Attempt ${attempt}/${maxRetries})`);

      // 1. Establish Database Connection with auto-retry
      await connectDatabase();

      // 2. Start HTTP Server
      await new Promise<void>((resolve, reject) => {
        server = app.listen(env.port, () => {
          logger.info(`🚀 API server is running on http://localhost:${env.port}`);
          logger.info(`Environment: ${env.nodeEnv} | Node.js: ${process.version}`);
          resolve();
        });

        server.once("error", (err: any) => {
          reject(err);
        });
      });

      return; // Server started successfully
    } catch (error: any) {
      logger.error(`Server startup failure on attempt ${attempt}/${maxRetries}:`, error);

      if (server) {
        server.close();
        server = null;
      }

      if (attempt >= maxRetries) {
        logger.error(`Exceeded maximum server startup attempts (${maxRetries}).`);
        process.exit(1);
      }

      const delay = Math.min(retryDelayMs * Math.pow(1.5, attempt - 1), 30000);
      logger.warn(`Auto-restarting server in ${(delay / 1000).toFixed(1)}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn(`Received ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(() => {
      logger.info("HTTP server closed.");
    });
  }

  try {
    await mongoose.connection.close(false);
    logger.info("MongoDB connection closed.");
  } catch (err) {
    logger.error("Error closing MongoDB connection:", err);
  }

  // Force exit after 10 seconds timeout
  setTimeout(() => {
    logger.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000).unref();

  logger.info("Graceful shutdown completed successfully.");
  process.exit(0);
};

// ─── Process Error Handling ───────────────────────────────────────────────────
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Promise Rejection detected:", {
    reason: reason instanceof Error ? reason.stack || reason.message : reason,
    promise,
  });
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception encountered in application:", error);
  // Give logger time to flush and then trigger graceful shutdown
  setTimeout(() => {
    gracefulShutdown("UNCAUGHT_EXCEPTION").catch(() => process.exit(1));
  }, 500);
});

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// ─── Launch ───────────────────────────────────────────────────────────────────
startServer().catch((error) => {
  logger.error("Fatal error during server startup:", error);
  process.exit(1);
});
