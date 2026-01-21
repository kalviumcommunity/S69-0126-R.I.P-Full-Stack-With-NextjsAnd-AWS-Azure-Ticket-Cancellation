import jwt, { JwtPayload } from "jsonwebtoken";

export interface TokenPayload {
  id: number;
  email: string;
  role: "admin" | "user";
  iat?: number;
  exp?: number;
}

export const getJWTSecret = () => {
  return process.env.JWT_SECRET || "supersecretkey";
};

/**
 * Sign an access token (short-lived, 15 minutes)
 */
export const signAccessToken = (
  payload: Omit<TokenPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: "15m",
    algorithm: "HS256",
  });
};

/**
 * Sign a refresh token (long-lived, 7 days)
 */
export const signRefreshToken = (
  payload: Omit<TokenPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

/**
 * Legacy function for backward compatibility - signs 1h token
 */
export const signToken = (payload: object, expiresIn = "1h"): string => {
  return jwt.sign(payload, getJWTSecret(), { expiresIn });
};

/**
 * Verify and decode a token
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, getJWTSecret()) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    }
    throw new Error("Invalid token");
  }
};

/**
 * Verify access token specifically
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return verifyToken(token);
};

/**
 * Verify refresh token specifically
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return verifyToken(token);
};
