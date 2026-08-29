import { prisma } from "../database/prisma";
import { generateUlid } from "../../lib/ulid";

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  lockoutSeconds?: number;
  message?: string;
}

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

/**
 * Check whether a login attempt is allowed under brute-force mitigation rate limits.
 */
export async function checkLoginRateLimit(
  identifier: string,
  ipAddress: string
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  // Check recent failed attempts for this identifier or IP
  const [failedByIdentifier, failedByIp] = await Promise.all([
    prisma.logPercobaanLogin.count({
      where: {
        identifier: identifier.toLowerCase().trim(),
        sukses: false,
        dibuat_pada: { gte: windowStart },
      },
    }),
    prisma.logPercobaanLogin.count({
      where: {
        ip_address: ipAddress,
        sukses: false,
        dibuat_pada: { gte: windowStart },
      },
    }),
  ]);

  const maxFailed = Math.max(failedByIdentifier, failedByIp);

  if (maxFailed >= MAX_FAILED_ATTEMPTS) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutSeconds: WINDOW_MINUTES * 60,
      message: `Terlalu banyak percobaan login gagal. Silakan coba lagi dalam ${WINDOW_MINUTES} menit.`,
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_FAILED_ATTEMPTS - maxFailed,
  };
}

/**
 * Record a login attempt into log_percobaan_login for rate limiting and security audit.
 */
export async function recordLoginAttempt(
  identifier: string,
  ipAddress: string,
  success: boolean,
  reason?: string
): Promise<void> {
  await prisma.logPercobaanLogin.create({
    data: {
      id: generateUlid(),
      identifier: identifier.toLowerCase().trim(),
      ip_address: ipAddress,
      sukses: success,
      alasan_gagal: reason ?? null,
    },
  });
}
