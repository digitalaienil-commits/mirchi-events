"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { clearFailures, isRateLimited, recordFailure } from "@/lib/rate-limit";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import type { FormState } from "@/lib/types";

// Used when the email doesn't exist, so response time doesn't reveal which emails are admins.
const DUMMY_HASH = `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`;

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${ip}:${email}`;
  if (isRateLimited(key)) return { error: "Too many attempts. Please wait 15 minutes and try again." };

  const [admin] = await query<{ id: string; password_hash: string }>(
    "select id, password_hash from admins where email = $1",
    [email],
  );
  const ok = await verifyPassword(password, admin?.password_hash ?? DUMMY_HASH);

  if (!admin || !ok) {
    recordFailure(key);
    return { error: "Wrong email or password." };
  }

  clearFailures(key);
  await query("update admins set last_login_at = now() where id = $1", [admin.id]);
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(admin.id), sessionCookieOptions());
  redirect("/admin");
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
