"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

export type AccountRowClient = {
  _id: string;
  name?: string;
  email: string;
  joinedDisplay: string;
  purchasesCount: number;
  reviewsCount: number;
};

type DeletedSummary = {
  count: number;
  purchasesTotal: number;
  reviewsTotal: number;
};

type Props = {
  users: AccountRowClient[];
  adminEmail: string;
  deletedSummary: DeletedSummary | null;
};

export default function AdminAccountsTable({ users, adminEmail, deletedSummary }: Props) {
  const router = useRouter();
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

  const deleteUser = async (email: string, label: string) => {
    const ok = window.confirm(
      `Delete account ${email} (${label})?\n\nTheir purchases and reviews stay on file for analytics (same as self-delete).`
    );
    if (!ok) return;

    setBusyEmail(email);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.message === "string" ? data.message : "Delete failed");
      toast.success("User deleted.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyEmail(null);
    }
  };

  return (
    <>
      <h2 className="text-3xl">Accounts</h2>
      <p className="text-sm text-slate-500 mt-1">Registered storefront users.</p>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-t border-[#ececec]">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Purchases</th>
              <th className="text-left py-2">Reviews</th>
              <th className="text-left py-2">Joined</th>
              <th className="text-right py-2 w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.email.trim().toLowerCase() === adminEmail;
              return (
                <tr key={user._id} className="border-t border-[#f1f1f1]">
                  <td className="py-2">{user.name || "—"}</td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{user.purchasesCount}</td>
                  <td className="py-2">{user.reviewsCount}</td>
                  <td className="py-2">{user.joinedDisplay}</td>
                  <td className="py-2 text-right">
                    {isSelf ? (
                      <span className="text-xs text-slate-400">Current session</span>
                    ) : (
                      <button
                        type="button"
                        disabled={busyEmail === user.email}
                        onClick={() => deleteUser(user.email, user.name || user.email)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-40 transition"
                      >
                        {busyEmail === user.email ? "…" : "Delete"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {deletedSummary && deletedSummary.count > 0 && (
              <tr className="border-t border-[#f1f1f1] bg-slate-50/80">
                <td className="py-2 font-medium text-slate-800">
                  Deleted users ({deletedSummary.count})
                </td>
                <td className="py-2 text-slate-400">—</td>
                <td className="py-2 font-medium">{deletedSummary.purchasesTotal}</td>
                <td className="py-2 font-medium">{deletedSummary.reviewsTotal}</td>
                <td className="py-2 text-slate-400">—</td>
                <td className="py-2 text-slate-400 text-right">—</td>
              </tr>
            )}
            {users.length === 0 && (
              <tr>
                <td className="py-4 text-slate-500" colSpan={6}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {deletedSummary && deletedSummary.count > 0 && (
          <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-xl">
            The row above sums purchases and reviews for storefront accounts that were deleted (history is kept under their former email id). Guest checkout under “anonymous” is excluded.
          </p>
        )}
      </div>
    </>
  );
}
