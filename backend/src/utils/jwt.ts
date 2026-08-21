import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  userId: string;
  email?: string;
  username?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion?: number;
}

/**
 * Generate short-lived Access Token (e.g. 15m)
 */
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
};

/**
 * Generate long-lived Refresh Token (e.g. 30d)
 */
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions["expiresIn"],
  });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
};

// Aliases for backwards compatibility if needed
export const signToken = (payload: { userId: string }) => generateAccessToken(payload);
export const verifyToken = (token: string) => verifyAccessToken(token);
