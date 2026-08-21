import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/auth.routes.js";
import { postRoutes } from "./routes/post.routes.js";
import { notificationRoutes } from "./routes/notification.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";

export const app = express();
app.use(cors({ origin: env.clientOrigin === "*" ? true : env.clientOrigin }));
app.use(express.json({ limit: "1mb" }));
app.get("/health", (_request, response) => response.json({ success: true, data: { status: "ok" } }));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
