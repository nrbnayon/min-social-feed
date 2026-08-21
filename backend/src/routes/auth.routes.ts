import { Router } from "express";
import {
  registerController,
  loginController,
  getMeController,
  refreshTokenController,
  editProfileController,
  logoutController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  editProfileSchema,
} from "../validations/auth.validation.js";

export const authRoutes = Router();

// Public routes
authRoutes.post("/register", validate(registerSchema), registerController);
authRoutes.post("/login", validate(loginSchema), loginController);
authRoutes.post("/refresh-token", validate(refreshTokenSchema), refreshTokenController);

// Protected routes
authRoutes.get("/get-me", requireAuth, getMeController);
authRoutes.get("/me", requireAuth, getMeController);
authRoutes.put("/edit-profile", requireAuth, validate(editProfileSchema), editProfileController);
authRoutes.patch("/edit-profile", requireAuth, validate(editProfileSchema), editProfileController);
authRoutes.post("/logout", requireAuth, logoutController);
