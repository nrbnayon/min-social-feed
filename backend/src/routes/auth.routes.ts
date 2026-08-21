import { Router } from "express";
import {
  registerController,
  loginController,
  getMeController,
  refreshTokenController,
  editProfileController,
  logoutController,
  registerDeviceTokenController,
  getNotificationsController,
  markNotificationReadController,
  markAllReadController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  editProfileSchema,
  deviceTokenSchema,
} from "../validations/auth.validation.js";

export const authRoutes = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
authRoutes.post("/register", validate(registerSchema), registerController);
authRoutes.post("/login", validate(loginSchema), loginController);
authRoutes.post("/refresh-token", validate(refreshTokenSchema), refreshTokenController);

// ─── Protected ────────────────────────────────────────────────────────────────
authRoutes.get("/get-me", requireAuth, getMeController);
authRoutes.get("/me", requireAuth, getMeController);
authRoutes.put("/edit-profile", requireAuth, validate(editProfileSchema), editProfileController);
authRoutes.patch("/edit-profile", requireAuth, validate(editProfileSchema), editProfileController);
authRoutes.post("/logout", requireAuth, logoutController);

// Device push token — called right after login/register
authRoutes.post("/device-token", requireAuth, validate(deviceTokenSchema), registerDeviceTokenController);

// Notifications (user-scoped, lives under /auth to share the requireAuth middleware)
authRoutes.get("/notifications", requireAuth, getNotificationsController);
authRoutes.patch("/notifications/read-all", requireAuth, markAllReadController);
authRoutes.patch("/notifications/:id/read", requireAuth, markNotificationReadController);
