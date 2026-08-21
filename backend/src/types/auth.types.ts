// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface RegisterDTO {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  /** Accepts either email address or username */
  email: string;
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

// ─── Safe User (public-facing profile shape) ─────────────────────────────────

/**
 * The public profile object returned by toPublicJSON().
 * All fields that toPublicJSON always populates are non-optional here
 * so callers don't need unnecessary null checks.
 */
export interface SafeUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  avatarUrl: string;
  coverImage: string;
  bio: string;
  location: string;
  website: string;
  verified: boolean;
  /** Computed count of followers */
  followers: number;
  /** Computed count of following */
  following: number;
  /** List of follower IDs (string ObjectIds) */
  followersList: string[];
  /** List of following IDs (string ObjectIds) */
  followingList: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Auth API Response shapes ─────────────────────────────────────────────────

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ProfileResponse {
  user: SafeUser;
}
