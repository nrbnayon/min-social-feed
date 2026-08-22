import { Router } from "express";
import {
  followUserHandler,
  getSuggestionsHandler,
  getFollowingHandler,
  getUserProfileHandler,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const userRoutes = Router();

userRoutes.get("/suggestions", requireAuth, getSuggestionsHandler);
userRoutes.get("/following", requireAuth, getFollowingHandler);
userRoutes.post("/:id/follow", requireAuth, followUserHandler);
userRoutes.get("/:id", requireAuth, getUserProfileHandler);
