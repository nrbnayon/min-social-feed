import { Router } from "express";
import { getNotifications } from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const notificationRoutes = Router();
notificationRoutes.get("/", requireAuth, getNotifications);
