import type { RequestHandler } from "express";
import {
  login,
  register,
  getMe,
  refreshUserToken,
  editProfile,
  logoutUser,
} from "../services/auth.service.js";
import { sendSuccess } from "../utils/api-response.js";

/**
 * POST /api/auth/register
 */
export const registerController: RequestHandler = async (req, res, next) => {
  try {
    const result = await register(req.body);
    return sendSuccess(res, result, "Account registered successfully.", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const result = await login(req.body);
    return sendSuccess(res, result, "Logged in successfully.", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/get-me & GET /api/auth/me
 */
export const getMeController: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!._id.toString();
    const result = await getMe(userId);
    return sendSuccess(res, result, "User profile fetched successfully.", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh-token
 */
export const refreshTokenController: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshUserToken(refreshToken);
    return sendSuccess(res, result, "Token refreshed successfully.", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/edit-profile & PATCH /api/auth/profile
 */
export const editProfileController: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!._id.toString();
    const result = await editProfile(userId, req.body);
    return sendSuccess(res, result, "Profile updated successfully.", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!._id.toString();
    const { refreshToken } = req.body;
    const result = await logoutUser(userId, refreshToken);
    return sendSuccess(res, result, "Logged out successfully.", 200);
  } catch (error) {
    next(error);
  }
};
