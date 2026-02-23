import jwt from "jsonwebtoken";
import { requireEnv } from "./requireEnv";
import { redis } from "../redis/redis-client";
import { AppError } from "./AppError";
import { randomBytes } from "crypto";

export interface TokenPayload {
  userId: string;
}

export interface InviteTokenPayload {
  orgId: string;
  email: string;
}

const ACCESS_TOKEN_SECRET = requireEnv("JWT_SECRET");
const REFRESH_TOKEN_SECRET = requireEnv("REFRESH_TOKEN_SECRET");
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const INVITE_TOKEN_SECRET = requireEnv("INVITE_TOKEN_SECRET");
const INVITE_TOKEN_TTL_SECONDS = 60 * 60 * 24;

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m"
  });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d"
  });

  return { accessToken, refreshToken };
};

export const storeRefreshToken = async (
  userId: string,
  refreshToken: string
) => {
  await redis.set(
    `refreshToken:${refreshToken}`,
    userId,
    "EX",
    REFRESH_TOKEN_TTL_SECONDS
  );
};

export const rotateRefreshToken = async (refreshToken: string) => {
  const userId = await redis.get(`refreshToken:${refreshToken}`);

  if (!userId) {
    throw new AppError("Invalid or already used refresh token", 401);
  }

  await redis.del(`refreshToken:${refreshToken}`);

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(userId);

  await storeRefreshToken(userId, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
};

export const revokeRefreshToken = async (refreshToken: string) => {
  const result = await redis.del(`refreshToken:${refreshToken}`);

  if (result === 0) {
    throw new AppError("Refresh token not found or already revoked", 401);
  }
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new AppError("Access token expired", 401);
    }
    throw new AppError("Invalid token", 401);
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new AppError("Refresh token expired", 401);
    }
    throw new AppError("Invalid token", 401);
  }
};

export const generateTempPassword = (): string => {
  return randomBytes(8).toString("hex");
};

export const generateInviteToken = (orgId: string, email: string): string => {
  return jwt.sign({ orgId, email }, INVITE_TOKEN_SECRET, { expiresIn: "1d" });
};

export const verifyInviteToken = (token: string): InviteTokenPayload => {
  try {
    return jwt.verify(token, INVITE_TOKEN_SECRET) as InviteTokenPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new AppError("Invite token has expired", 401);
    }
    throw new AppError("Invalid invite token", 401);
  }
};

export const storeInviteToken = async (token: string, email: string) => {
  await redis.set(
    `inviteToken:${token}`,
    email,
    "EX",
    INVITE_TOKEN_TTL_SECONDS
  );
};

export const consumeInviteToken = async (token: string) => {
  const result = await redis.del(`inviteToken:${token}`);
  if (result === 0) {
    throw new AppError("Invite token already used or invalid", 401);
  }
};
