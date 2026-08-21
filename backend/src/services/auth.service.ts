import { User, type UserDocument } from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export interface RegisterDTO {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string; // Accepts email or username
  password: string;
}

export interface EditProfileDTO {
  name?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  coverImage?: string;
}

/**
 * Register a new user
 */
export const register = async (input: RegisterDTO) => {
  const normalizedEmail = input.email.toLowerCase().trim();
  const normalizedUsername = input.username.toLowerCase().trim();

  // Check if email already exists
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    throw new AuthError("An account with this email address already exists.", 409);
  }

  // Check if username already exists
  const existingUsername = await User.findOne({ username: normalizedUsername });
  if (existingUsername) {
    throw new AuthError("This username is already taken. Please choose another.", 409);
  }

  // Hash password with salt
  const passwordHash = await hashPassword(input.password);

  // Default avatar generator based on name
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(
    normalizedUsername
  )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  // Create new user in database
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

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Store refresh token
  user.refreshTokens = [refreshToken];
  await user.save();

  return {
    user: user.toPublicJSON(),
    accessToken,
    refreshToken,
  };
};

/**
 * Log in an existing user (by email or username)
 */
export const login = async (input: LoginDTO) => {
  const identifier = input.email.toLowerCase().trim();

  // Find user by email or username, explicitly selecting passwordHash and refreshTokens
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select("+passwordHash +refreshTokens");

  if (!user) {
    throw new AuthError("Invalid email/username or password.", 401);
  }

  // Compare password
  const isMatch = await comparePassword(input.password, user.passwordHash);
  if (!isMatch) {
    throw new AuthError("Invalid email/username or password.", 401);
  }

  // Generate fresh tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Keep last 5 valid refresh tokens for multi-device support
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

/**
 * Get current authenticated user profile
 */
export const getMe = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError("User account not found.", 404);
  }

  return {
    user: user.toPublicJSON(),
  };
};

/**
 * Rotate Refresh Token & Issue new Access Token
 */
export const refreshUserToken = async (incomingRefreshToken: string) => {
  if (!incomingRefreshToken) {
    throw new AuthError("Refresh token is required.", 400);
  }

  let decoded: { userId: string };
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    throw new AuthError("Invalid or expired refresh token. Please sign in again.", 401);
  }

  // Find user with refreshTokens
  const user = await User.findById(decoded.userId).select("+refreshTokens");
  if (!user) {
    throw new AuthError("User no longer exists.", 401);
  }

  // Check if the refresh token is in the user's active tokens
  const tokenIndex = (user.refreshTokens || []).indexOf(incomingRefreshToken);
  if (tokenIndex === -1) {
    // Token reuse detected or already revoked - clear all for security
    user.refreshTokens = [];
    await user.save();
    throw new AuthError("Suspicious refresh token reuse detected. Please sign in again.", 403);
  }

  // Generate new token pair
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });
  const newRefreshToken = generateRefreshToken({ userId: user.id });

  // Replace old refresh token with new one (Token Rotation)
  user.refreshTokens.splice(tokenIndex, 1, newRefreshToken);
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Edit User Profile
 */
export const editProfile = async (userId: string, data: EditProfileDTO) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError("User account not found.", 404);
  }

  // If username is being changed, check uniqueness
  if (data.username && data.username.toLowerCase().trim() !== user.username) {
    const newUsername = data.username.toLowerCase().trim();
    const existing = await User.findOne({
      username: newUsername,
      _id: { $ne: user._id },
    });
    if (existing) {
      throw new AuthError("This username is already taken.", 409);
    }
    user.username = newUsername;
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

  return {
    user: user.toPublicJSON(),
  };
};

/**
 * Logout User (Revoke Refresh Token)
 */
export const logoutUser = async (userId: string, refreshToken?: string) => {
  const user = await User.findById(userId).select("+refreshTokens");
  if (user) {
    if (refreshToken) {
      user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== refreshToken);
    } else {
      user.refreshTokens = [];
    }
    await user.save();
  }
  return { message: "Successfully logged out." };
};
