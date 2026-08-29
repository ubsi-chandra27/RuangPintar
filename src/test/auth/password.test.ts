import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, validatePasswordPolicy } from "@/shared/lib/password";

describe("Password Security & Policy Baseline", () => {
  it("hashes password and verifies match correctly", async () => {
    const rawPassword = "RuangPintar2026!";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2")).toBe(true);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword123", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("validates password policy (minimum 8 chars with letter and number)", () => {
    expect(validatePasswordPolicy("Pass1234").valid).toBe(true);
    expect(validatePasswordPolicy("short1").valid).toBe(false); // < 8 chars
    expect(validatePasswordPolicy("onlyletters").valid).toBe(false); // no numbers
    expect(validatePasswordPolicy("12345678").valid).toBe(false); // no letters
    expect(validatePasswordPolicy("").valid).toBe(false);
  });
});
