import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash plaintext password using bcrypt with standard salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify plaintext password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return await bcrypt.compare(password, hash);
}

export interface PasswordPolicyResult {
  valid: boolean;
  message?: string;
}

/**
 * Validate password against baseline security policy:
 * - Minimum 8 characters
 * - Must contain at least one letter and one number
 */
export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Kata sandi wajib diisi." };
  }

  if (password.length < 8) {
    return { valid: false, message: "Kata sandi minimal 8 karakter." };
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: "Kata sandi harus mengandung kombinasi huruf dan angka." };
  }

  return { valid: true };
}
