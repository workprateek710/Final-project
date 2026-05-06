"use client";

import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { PasswordInput } from "@/components/ui/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const redirectTo = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const verifyRes = await fetch("/api/auth/verify-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      if (!verifyRes.ok) {
        setError("Invalid email or password.");
        return;
      }

      // Best-effort NextAuth session for admin-compatible areas, but do not block storefront login.
      await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
        callbackUrl: redirectTo,
      }).catch(() => null);
      const session = await getSession().catch(() => null);
      const uid = session?.user?.email ?? normalizedEmail;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", uid);
      }
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur px-8 py-10 space-y-6">
          <div className="text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Volta</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in with the email you registered in MongoDB.</p>
          </div>

          {registered && (
            <p className="text-sm text-center text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg py-2 px-3">
              Account created — you can sign in now.
            </p>
          )}

          {redirectTo === "/checkout" && !registered && (
            <div className="text-sm text-center text-amber-800 bg-amber-50 border border-amber-100 rounded-lg py-2 px-3">
              Please sign in to complete your purchase.{" "}
              <a href="/signup?redirect=/checkout" className="font-semibold underline">
                Create account
              </a>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-slate-600 mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-slate-600 mb-1.5">
                Password
              </label>
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputClassName="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 text-white py-3.5 font-semibold text-sm hover:bg-slate-800 disabled:opacity-60 transition shadow-lg shadow-slate-900/10"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Create an account
            </Link>
          </p>
          <p className="text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
            Admin demo: <code className="text-slate-600">admin@volta.test</code> /{" "}
            <code className="text-slate-600">demo123</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] bg-slate-50" />}>
      <LoginForm />
    </Suspense>
  );
}
