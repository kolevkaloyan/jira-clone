import { Response } from "express";

const REFRESH_TOKEN_COOKIE = "refreshToken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions);
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
};
