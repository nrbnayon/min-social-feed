import type { RequestHandler } from "express";
import { User } from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/api-response.js";

export const requireAuth: RequestHandler = async (request, response, next) => {
  try {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) return sendError(response, "Authentication required", 401);
    const { userId } = verifyToken(header.slice(7));
    const user = await User.findById(userId);
    if (!user) return sendError(response, "User not found", 401);
    request.user = user;
    next();
  } catch {
    sendError(response, "Invalid or expired token", 401);
  }
};
