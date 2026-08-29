"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/shared/infrastructure/auth/auth-service";
import { identityService } from "@/shared/infrastructure/auth/identity-service";
import { getCurrentUser } from "@/shared/infrastructure/auth/auth-guard";
import {
  getSessionCookieOptions,
  getExpiredSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/shared/lib/session";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  mustChangePassword?: boolean;
  redirectUrl?: string;
}

/**
 * Server Action for User Login.
 */
export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const username = formData.get("username")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const rememberMe = formData.get("remember") === "on" || formData.get("remember") === "true";

  if (!username.trim() || !password) {
    return {
      success: false,
      error: "Username dan kata sandi wajib diisi.",
    };
  }

  const reqHeaders = await headers();
  const ipAddress =
    reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    reqHeaders.get("x-real-ip") ||
    "127.0.0.1";
  const userAgent = reqHeaders.get("user-agent") || undefined;

  const result = await authService.loginWithCredentials({
    username,
    password,
    rememberMe,
    ipAddress,
    userAgent,
  });

  if (!result.success || !result.sessionToken || !result.user) {
    return {
      success: false,
      error: result.error ?? "Login gagal. Periksa kembali akun Anda.",
    };
  }

  // Set session cookie
  const cookieOptions = getSessionCookieOptions(result.sessionToken, rememberMe);
  const cookieStore = await cookies();
  cookieStore.set(cookieOptions.name, cookieOptions.value, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
    expires: cookieOptions.expires,
    maxAge: cookieOptions.maxAge,
  });

  if (result.user.harus_ganti_password) {
    return {
      success: true,
      mustChangePassword: true,
      redirectUrl: "/ganti-password",
    };
  }

  return {
    success: true,
    redirectUrl: "/",
  };
}

/**
 * Server Action for User Logout.
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await authService.revokeSession(sessionToken);
  }

  const expiredOptions = getExpiredSessionCookieOptions();
  cookieStore.set(expiredOptions.name, expiredOptions.value, {
    httpOnly: expiredOptions.httpOnly,
    secure: expiredOptions.secure,
    sameSite: expiredOptions.sameSite,
    path: expiredOptions.path,
    expires: expiredOptions.expires,
    maxAge: expiredOptions.maxAge,
  });

  redirect("/login");
}

/**
 * Server Action for Mandatory or Voluntary Password Change.
 */
export async function changePasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: "Sesi telah berakhir. Silakan login kembali.",
    };
  }

  const oldPassword = formData.get("oldPassword")?.toString() ?? "";
  const newPassword = formData.get("newPassword")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  if (!oldPassword || !newPassword || !confirmPassword) {
    return {
      success: false,
      error: "Semua kolom kata sandi wajib diisi.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: "Konfirmasi kata sandi baru tidak cocok.",
    };
  }

  const reqHeaders = await headers();
  const ipAddress = reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = reqHeaders.get("user-agent") || undefined;

  const result = await identityService.changePassword(
    user.id,
    oldPassword,
    newPassword,
    ipAddress,
    userAgent
  );

  if (!result.success) {
    return {
      success: false,
      error: result.error ?? "Gagal mengubah kata sandi.",
    };
  }

  return {
    success: true,
    redirectUrl: "/",
  };
}
