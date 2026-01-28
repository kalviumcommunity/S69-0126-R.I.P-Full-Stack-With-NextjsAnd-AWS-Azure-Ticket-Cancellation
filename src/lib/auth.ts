import { SignJWT, jwtVerify } from "jose";

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
 * Sign an access token (24 hours)
 */
export const signAccessToken = async (
  payload: Omit<TokenPayload, "iat" | "exp">
): Promise<string> => {
  return await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(getJWTSecret()));
};

/**
 * Sign a refresh token (long-lived, 90 days)
 */
export const signRefreshToken = async (
  payload: Omit<TokenPayload, "iat" | "exp">
): Promise<string> => {
  return await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("90d")
    .sign(new TextEncoder().encode(getJWTSecret()));
};

/**
 * Legacy function for backward compatibility - signs 1h token
 */
export const signToken = async (payload: object, expiresIn = "1h"): Promise<string> => {
  return await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(getJWTSecret()));
};

/**
 * Verify and decode a token using jose (Edge-compatible)
 */
export const verifyToken = async (token: string): Promise<TokenPayload> => {
  try {
    const JWT_SECRET = new TextEncoder().encode(getJWTSecret());
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      throw new Error("Token has expired");
    }
    throw new Error("Invalid token");
  }
};

/**
 * Verify access token specifically
 */
export const verifyAccessToken = async (token: string): Promise<TokenPayload> => {
  return await verifyToken(token);
};

/**
 * Verify refresh token specifically
 */
export const verifyRefreshToken = async (token: string): Promise<TokenPayload> => {
  return await verifyToken(token);
};
