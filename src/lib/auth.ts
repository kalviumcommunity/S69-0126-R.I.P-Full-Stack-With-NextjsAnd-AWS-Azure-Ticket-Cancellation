import jwt, { JwtPayload } from "jsonwebtoken";

export const getJWTSecret = () => {
  return process.env.JWT_SECRET || "supersecretkey";
};

export const signToken = (payload: object, expiresIn = "1h"): string => {
  return jwt.sign(payload, getJWTSecret(), { expiresIn });
};

export const verifyToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, getJWTSecret());
};
