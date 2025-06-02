// lib/auth.ts
import { cookies } from "next/headers";

const ADMIN_SESSION_KEY = "admin-session";

// Login logic is moved to lib/actions.ts
// export async function login(password: string) { ... } // REMOVE THIS

export async function logout() {
  cookies().delete(ADMIN_SESSION_KEY);
}

export async function isAdminLoggedIn() {
  const session = cookies().get(ADMIN_SESSION_KEY);
  return session?.value === "true";
}
