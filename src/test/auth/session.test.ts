import { describe, it, expect } from "vitest";
import {
  generateSessionToken,
  hashSessionToken,
  getSessionCookieOptions,
  getExpiredSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/shared/lib/session";

describe("Session Token & Cookie Security Baseline", () => {
  it("generates 64-char hex session token and deterministic SHA-256 hash", () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);

    const hash1a = hashSessionToken(token1);
    const hash1b = hashSessionToken(token1);
    const hash2 = hashSessionToken(token2);

    expect(hash1a).toBe(hash1b);
    expect(hash1a).not.toBe(hash2);
    expect(hash1a).toHaveLength(64);
  });

  it("configures secure httpOnly cookie options for session", () => {
    const token = generateSessionToken();
    const standardCookie = getSessionCookieOptions(token, false);

    expect(standardCookie.name).toBe(SESSION_COOKIE_NAME);
    expect(standardCookie.value).toBe(token);
    expect(standardCookie.httpOnly).toBe(true);
    expect(standardCookie.sameSite).toBe("lax");
    expect(standardCookie.path).toBe("/");
    expect(standardCookie.maxAge).toBe(24 * 60 * 60);

    const rememberCookie = getSessionCookieOptions(token, true);
    expect(rememberCookie.maxAge).toBe(30 * 24 * 60 * 60);

    const expiredCookie = getExpiredSessionCookieOptions();
    expect(expiredCookie.value).toBe("");
    expect(expiredCookie.maxAge).toBe(0);
  });
});
