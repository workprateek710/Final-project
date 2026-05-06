import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";

export function getAdminEmails(): string[] {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "admin@volta.test")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Session only if signed in and email is in NEXT_PUBLIC_ADMIN_EMAILS */
export async function requireAdminSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email || !getAdminEmails().includes(email)) return null;
  return session;
}
