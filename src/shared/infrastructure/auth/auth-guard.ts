import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService, AuthenticatedUser } from "./auth-service";
import { SESSION_COOKIE_NAME } from "../../lib/session";

/**
 * Retrieve the current authenticated user from server cookies without throwing if unauthenticated or outside request context.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const validated = await authService.validateSession(sessionToken);
    return validated ? validated.user : null;
  } catch {
    return null;
  }
}

/**
 * Server guard: requires a valid authenticated session, redirecting to /login if missing,
 * and redirecting to /ganti-password if password change is required.
 */
export async function requireAuth(options?: {
  allowPasswordRequired?: boolean;
}): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.harus_ganti_password && !options?.allowPasswordRequired) {
    redirect("/ganti-password");
  }

  return user;
}
