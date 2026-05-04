"use client";

import Loader from "@/components/admin-panel/Loader";
import Login from "@/components/admin-panel/Login";
import Sidebar from "@/components/admin-panel/Sidebar";
import { useAppSelector } from "@/redux/hooks";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";

// Emails that are allowed to access the admin panel.
// Add more by setting NEXT_PUBLIC_ADMIN_EMAILS="a@b.com,c@d.com" in .env.local
const ADMIN_EMAILS: string[] = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "admin@volta.test"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isLoading = useAppSelector((store) => store.loadingReducer);
  const { data: session, status } = useSession();

  // still loading session — render nothing to avoid flash
  if (status === "loading") return null;

  // not logged in → show admin login screen
  if (!session?.user) return <Login />;

  const userEmail = (session.user.email ?? "").toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(userEmail);

  // logged in but NOT an admin → access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl shadow-2xl p-10 space-y-5 text-white">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mx-auto">
              🚫
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-red-400">Access denied</h1>
              <p className="text-slate-400 text-sm">
                <span className="text-slate-300 font-medium">{session.user.email}</span> does not have admin privileges.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/"
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition"
              >
                ← Back to store
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/admin/dashboard" })}
                className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition"
              >
                Sign out and try a different account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ admin confirmed
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full h-full">
        <div className="bg-gray-200 p-4 h-[calc(100vh-64px)]">{children}</div>
      </div>
      {isLoading && <Loader />}
    </div>
  );
};

export default Layout;
