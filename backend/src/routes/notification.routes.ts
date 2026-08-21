import { Router } from "express";
import {
  getNotificationsController,
  markReadController,
  markAllReadController,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const notificationRoutes = Router();

notificationRoutes.get("/", requireAuth, getNotificationsController);
notificationRoutes.patch("/:id/read", requireAuth, markReadController);
notificationRoutes.patch("/read-all", requireAuth, markAllReadController);
