import { cookies } from "next/headers";
import { query } from "./db";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export type Admin = { id: string; email: string };

// The signed-in admin, or null. Checks the database so removed admins lose access immediately.
export async function getAdmin(): Promise<Admin | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  const [admin] = await query<Admin>("select id, email from admins where id = $1", [session.sub]);
  return admin ?? null;
}

// Every server action and upload calls this before writing.
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) throw new Error("Your session has expired. Please sign in again.");
  return admin;
}
