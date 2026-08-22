import mongoose from "mongoose";
import { User, type UserDocument } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { AppError } from "../utils/app-error.js";
import { createAndSendNotification } from "./notification.service.js";
import { logger } from "../utils/logger.js";

/**
 * Toggle follow/unfollow a target user.
 */
export const toggleFollowUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<{ following: boolean; followersCount: number; followingCount: number }> => {
  if (!currentUserId || !targetUserId) {
    throw new AppError("Invalid user parameters.", 400);
  }

  if (currentUserId === targetUserId) {
    throw new AppError("You cannot follow yourself.", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new AppError("Target user not found.", 404);
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId),
  ]);

  if (!currentUser || !targetUser) {
    throw new AppError("User not found.", 404);
  }

  const isCurrentlyFollowing = (currentUser.following || []).some(
    (id: any) => id.toString() === targetUserId
  );

  if (isCurrentlyFollowing) {
    // Unfollow: pull IDs from both users
    await Promise.all([
      User.findByIdAndUpdate(currentUserId, {
        $pull: { following: new mongoose.Types.ObjectId(targetUserId) },
      }),
      User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: new mongoose.Types.ObjectId(currentUserId) },
      }),
      // Remove follow notification from DB
      Notification.deleteMany({
        recipient: targetUserId,
        sender: currentUserId,
        type: "follow",
      }),
    ]);

    const updatedTarget = await User.findById(targetUserId).select("followers following");
    const followersCount = updatedTarget?.followers?.length || 0;
    const followingCount = updatedTarget?.following?.length || 0;

    logger.info(`[UserService] User ${currentUserId} unfollowed ${targetUserId}`);
    return { following: false, followersCount, followingCount };
  } else {
    // Follow: addToSet IDs to both users
    await Promise.all([
      User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: new mongoose.Types.ObjectId(targetUserId) },
      }),
      User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: new mongoose.Types.ObjectId(currentUserId) },
      }),
    ]);

    // Send push & socket notification
    void createAndSendNotification(targetUserId, currentUserId, "follow");

    const updatedTarget = await User.findById(targetUserId).select("followers following");
    const followersCount = updatedTarget?.followers?.length || 0;
    const followingCount = updatedTarget?.following?.length || 0;

    logger.info(`[UserService] User ${currentUserId} followed ${targetUserId}`);
    return { following: true, followersCount, followingCount };
  }
};

/**
 * Get suggestions for new users to follow (excluding self and already followed).
 */
export const getSuggestedUsers = async (
  currentUserId: string,
  limit = 20
): Promise<any[]> => {
  const currentUser = await User.findById(currentUserId).select("following");
  const followingIds = (currentUser?.following || []).map((id: any) => id.toString());
  const excludedIds = [currentUserId, ...followingIds].map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const users = await User.find({
    _id: { $nin: excludedIds },
  })
    .select("id name username avatar avatarUrl verified bio followers following")
    .limit(limit)
    .lean();

  return users.map((u: any) => ({
    id: u._id.toString(),
    _id: u._id.toString(),
    name: u.name || u.username,
    username: u.username,
    avatar: u.avatar || u.avatarUrl || "",
    avatarUrl: u.avatarUrl || u.avatar || "",
    bio: u.bio || "",
    verified: Boolean(u.verified),
    followersCount: Array.isArray(u.followers) ? u.followers.length : 0,
    followingCount: Array.isArray(u.following) ? u.following.length : 0,
    isFollowing: false,
  }));
};

/**
 * Get list of users that the current user is following.
 */
export const getFollowingUsers = async (currentUserId: string): Promise<any[]> => {
  const currentUser = await User.findById(currentUserId)
    .populate({
      path: "following",
      select: "id name username avatar avatarUrl verified bio followers following",
    })
    .lean();

  const followingList = (currentUser?.following || []) as any[];

  return followingList.map((u: any) => ({
    id: u._id?.toString() || u.id,
    _id: u._id?.toString() || u.id,
    name: u.name || u.username,
    username: u.username,
    avatar: u.avatar || u.avatarUrl || "",
    avatarUrl: u.avatarUrl || u.avatar || "",
    bio: u.bio || "",
    verified: Boolean(u.verified),
    followersCount: Array.isArray(u.followers) ? u.followers.length : 0,
    followingCount: Array.isArray(u.following) ? u.following.length : 0,
    isFollowing: true,
  }));
};

/**
 * Get single user profile with computed following status.
 */
export const getUserProfile = async (
  targetIdOrUsername: string,
  currentUserId?: string
): Promise<any> => {
  const isObjectId = mongoose.Types.ObjectId.isValid(targetIdOrUsername);
  const query = isObjectId
    ? { _id: targetIdOrUsername }
    : { username: targetIdOrUsername.toLowerCase().trim().replace(/^@/, "") };

  const user = await User.findOne(query).select("-passwordHash -refreshTokens").lean();

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const followers = (user.followers || []).map((f: any) => f.toString());
  const following = (user.following || []).map((f: any) => f.toString());
  const isFollowing = currentUserId ? followers.includes(String(currentUserId)) : false;

  return {
    id: user._id.toString(),
    _id: user._id.toString(),
    name: user.name || user.username,
    username: user.username,
    email: user.email,
    avatar: user.avatar || user.avatarUrl || "",
    avatarUrl: user.avatarUrl || user.avatar || "",
    coverImage: user.coverImage || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    verified: Boolean(user.verified),
    followersCount: followers.length,
    followingCount: following.length,
    followersList: followers,
    followingList: following,
    isFollowing,
    createdAt: user.createdAt,
  };
};
