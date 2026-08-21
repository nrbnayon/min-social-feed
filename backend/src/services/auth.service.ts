import { User } from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { AuthError } from "../utils/app-error.js";
import type {
  RegisterDTO,
  LoginDTO,
  EditProfileDTO,
  AuthResponse,
  ProfileResponse,
  RefreshTokenResponse,
} from "../types/auth.types.js";

// Re-export AuthError so any existing imports from this file keep working
export { AuthError };

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Checks for duplicate email / username before creating the account.
 */
export const register = async (input: RegisterDTO): Promise<AuthResponse> => {
  const normalizedEmail = input.email.toLowerCase().trim();
  const normalizedUsername = input.username.toLowerCase().trim();

  // Check duplicates in a single query for efficiency
  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });
  if (existing) {
    if (existing.email === normalizedEmail) {
      throw new AuthError("An account with this email address already exists.", 409);
    }
    throw new AuthError("This username is already taken. Please choose another.", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(
    normalizedUsername
  )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  const user = new User({
    name: input.name.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    passwordHash,
    avatar: defaultAvatar,
    avatarUrl: defaultAvatar,
    followers: [],
    following: [],
    refreshTokens: [],
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });
  const refreshToken = generateRefreshToken({ userId: user.id });

  user.refreshTokens = [refreshToken];
  await user.save();

  return {
    user: user.toPublicJSON(),
    accessToken,
    refreshToken,
  };
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Log in an existing user by email or username.
 * Keeps up to 5 active refresh tokens for multi-device support.
 */
export const login = async (input: LoginDTO): Promise<AuthResponse> => {
  const identifier = input.email.toLowerCase().trim();

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select("+passwordHash +refreshTokens");

  if (!user) {
    throw new AuthError("Invalid email/username or password.", 401);
  }

  const isMatch = await comparePassword(input.password, user.passwordHash);
  if (!isMatch) {
    throw new AuthError("Invalid email/username or password.", 401);
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Keep last 4 valid tokens + new one (max 5 devices)
  const existingTokens = Array.isArray(user.refreshTokens)
    ? user.refreshTokens.slice(-4)
    : [];
  user.refreshTokens = [...existingTokens, refreshToken];
  await user.save();

  return {
    user: user.toPublicJSON(),
    accessToken,
    refreshToken,
  };
};

// ─── Get Me ───────────────────────────────────────────────────────────────────

/**
 * Fetch the currently authenticated user's profile.
 */
export const getMe = async (userId: string): Promise<ProfileResponse> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError("User account not found.", 404);
  }
  return { user: user.toPublicJSON() };
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

/**
 * Rotate the refresh token and issue a new access token.
 * Implements refresh token reuse detection — if a revoked token is presented,
 * all sessions are invalidated immediately.
 */
export const refreshUserToken = async (
  incomingRefreshToken: string
): Promise<RefreshTokenResponse> => {
  if (!incomingRefreshToken) {
    throw new AuthError("Refresh token is required.", 400);
  }

  let decoded: { userId: string };
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new AuthError("Invalid or expired refresh token. Please sign in again.", 401);
  }

  const user = await User.findById(decoded.userId).select("+refreshTokens");
  if (!user) {
    throw new AuthError("User no longer exists.", 401);
  }

  const tokenIndex = (user.refreshTokens || []).indexOf(incomingRefreshToken);
  if (tokenIndex === -1) {
    // Reuse detected — revoke all sessions for security
    user.refreshTokens = [];
    await user.save();
    throw new AuthError(
      "Suspicious refresh token reuse detected. All sessions have been revoked. Please sign in again.",
      403
    );
  }

  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });
  const newRefreshToken = generateRefreshToken({ userId: user.id });

  // Token rotation: replace old with new in-place
  user.refreshTokens.splice(tokenIndex, 1, newRefreshToken);
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// ─── Edit Profile ─────────────────────────────────────────────────────────────

/**
 * Update the authenticated user's profile fields.
 * Only fields explicitly provided in the payload are updated.
 */
export const editProfile = async (
  userId: string,
  data: EditProfileDTO
): Promise<ProfileResponse> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError("User account not found.", 404);
  }

  if (data.username) {
    const newUsername = data.username.toLowerCase().trim();
    if (newUsername !== user.username) {
      const taken = await User.findOne({
        username: newUsername,
        _id: { $ne: user._id },
      });
      if (taken) {
        throw new AuthError("This username is already taken.", 409);
      }
      user.username = newUsername;
    }
  }

  if (data.name !== undefined) user.name = data.name.trim();
  if (data.bio !== undefined) user.bio = data.bio.trim();
  if (data.location !== undefined) user.location = data.location.trim();
  if (data.website !== undefined) user.website = data.website.trim();
  if (data.avatar !== undefined) {
    user.avatar = data.avatar;
    user.avatarUrl = data.avatar;
  }
  if (data.coverImage !== undefined) user.coverImage = data.coverImage;

  await user.save();

  return { user: user.toPublicJSON() };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Revoke the provided refresh token (or all tokens if none is given).
 */
export const logoutUser = async (
  userId: string,
  refreshToken?: string
): Promise<{ message: string }> => {
  const user = await User.findById(userId).select("+refreshTokens");
  if (user) {
    user.refreshTokens = refreshToken
      ? (user.refreshTokens || []).filter((t) => t !== refreshToken)
      : [];
    await user.save();
  }
  return { message: "Successfully logged out." };
};
