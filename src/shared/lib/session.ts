import crypto from "crypto";

export const SESSION_COOKIE_NAME = "ruang_pintar_session";
export const SESSION_DURATION_STANDARD_MS = 24 * 60 * 60 * 1000; // 1 day
export const SESSION_DURATION_REMEMBER_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Generate a cryptographically secure random session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash session token with SHA-256 for secure database storage.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export interface CookieOptions {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  expires?: Date;
  maxAge?: number;
}

/**
 * Get standard cookie configuration for session storage.
 */
export function getSessionCookieOptions(token: string, rememberMe: boolean = false): CookieOptions {
  const durationMs = rememberMe ? SESSION_DURATION_REMEMBER_MS : SESSION_DURATION_STANDARD_MS;
  const isProduction = process.env.NODE_ENV === "production";

  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + durationMs),
    maxAge: Math.floor(durationMs / 1000),
  };
}

/**
 * Get cookie configuration to expire and clear session cookie on logout.
 */
export function getExpiredSessionCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  };
}
