import { CookieOptions } from "express";

export function accessCookieOptions(maxAgeMs: number): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    // Production splits the frontend (Vercel) and API (Render) across different
    // domains, which browsers treat as cross-site — that requires SameSite=None
    // (and Secure, which None mandates). Local dev keeps Lax since both sides
    // are on localhost (same site regardless of port).
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: maxAgeMs,
  };
}

export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // 15m
export const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30d
export const ADMIN_REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7d
