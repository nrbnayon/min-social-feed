import type { RequestHandler } from "express";
import {
  toggleFollowUser,
  getSuggestedUsers,
  getFollowingUsers,
  getUserProfile,
} from "../services/user.service.js";
import { sendSuccess } from "../utils/api-response.js";

/**
 * POST /api/users/:id/follow
 */
export const followUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const currentUserId = req.user!._id.toString();
    const targetUserId = String(req.params.id);
    const result = await toggleFollowUser(currentUserId, targetUserId);
    const message = result.following ? "User followed." : "User unfollowed.";
    return sendSuccess(res, result, message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/suggestions
 */
export const getSuggestionsHandler: RequestHandler = async (req, res, next) => {
  try {
    const currentUserId = req.user!._id.toString();
    const limit = Number(req.query.limit) || 20;
    const users = await getSuggestedUsers(currentUserId, limit);
    return sendSuccess(res, { users }, "Suggested users fetched successfully.", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/following
 */
export const getFollowingHandler: RequestHandler = async (req, res, next) => {
  try {
    const currentUserId = req.user!._id.toString();
    const users = await getFollowingUsers(currentUserId);
    return sendSuccess(res, { users }, "Following users fetched successfully.", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 */
export const getUserProfileHandler: RequestHandler = async (req, res, next) => {
  try {
    const currentUserId = req.user?._id?.toString();
    const targetIdOrUsername = String(req.params.id);
    const user = await getUserProfile(targetIdOrUsername, currentUserId);
    return sendSuccess(res, { user }, "User profile fetched successfully.", 200);
  } catch (error) {
    next(error);
  }
};
