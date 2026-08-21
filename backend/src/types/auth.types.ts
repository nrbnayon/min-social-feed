export interface SafeUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  followers: number;
  following: number;
  followersList?: string[];
  followingList?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
