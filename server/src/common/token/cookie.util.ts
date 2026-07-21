import { CookieOptions } from "express";

export function accessCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    // The frontend proxies all API calls through its own origin (see
    // next.config.ts rewrites), so the browser always sees this as a
    // same-site request — Lax is correct and safer than None in both
    // dev and production.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeMs,
  };
}

export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // 15m
export const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30d
export const ADMIN_REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7d
