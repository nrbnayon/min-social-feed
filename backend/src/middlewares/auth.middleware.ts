import type { RequestHandler } from "express";
import { User } from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { sendError } from "../utils/api-response.js";

export const requireAuth: RequestHandler = async (request, response, next) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(
        response,
        "Authentication required. Missing or malformed Authorization header.",
        401
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return sendError(response, "Access token missing.", 401);
    }

    const payload = verifyAccessToken(token);
    if (!payload?.userId) {
      return sendError(response, "Invalid access token payload.", 401);
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return sendError(response, "User account associated with this token not found.", 401);
    }

    request.user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return sendError(response, "Access token has expired. Please refresh your token.", 401, {
        code: "TOKEN_EXPIRED",
      });
    }
    return sendError(response, "Invalid access token.", 401);
  }
};
