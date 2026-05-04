"use client";

import { signOut, useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="bg-white h-[calc(100vh-96px)] rounded-lg p-4 overflow-auto">
      <h2 className="text-3xl">Settings</h2>
      <p className="text-sm text-slate-500 mt-1">Admin account/session controls.</p>

      <div className="mt-6 max-w-xl rounded-lg border border-slate-200 p-4 space-y-3">
        <div>
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="font-medium">{session?.user?.email || "Unknown user"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Admin mode</p>
          <p className="font-medium text-emerald-700">Active</p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/dashboard" })}
          className="mt-2 px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
        >
          Logout admin
        </button>
      </div>
    </div>
  );
}
