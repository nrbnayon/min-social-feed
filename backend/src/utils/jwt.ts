import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type TokenPayload = { userId: string };

export const signToken = (payload: TokenPayload) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
export const verifyToken = (token: string) => jwt.verify(token, env.jwtSecret) as TokenPayload;
