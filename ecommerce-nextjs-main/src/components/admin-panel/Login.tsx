"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState("admin@volta.test");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl p-8 space-y-6 text-white">
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Volta</p>
            <h1 className="text-2xl font-bold">Admin console</h1>
            <p className="text-sm text-slate-400">Secure access to catalog and orders.</p>
          </div>

          <button
            type="button"
            className="w-full py-3.5 flex gap-3 items-center justify-center rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition"
            onClick={() => signIn("google", { callbackUrl: "/admin/dashboard" })}
          >
            <FcGoogle size={24} />
            Continue with Google
          </button>
          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Requires <code className="text-slate-400">GOOGLE_CLIENT_ID</code> and{" "}
            <code className="text-slate-400">GOOGLE_CLIENT_SECRET</code> in <code className="text-slate-400">.env.local</code>.
          </p>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider text-slate-500">
              <span className="bg-slate-900/80 px-3">or email</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              type="email"
              placeholder="Email"
            />
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Password"
            />
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button
              type="button"
              className="w-full py-3.5 rounded-xl bg-accent hover:brightness-110 text-white font-semibold text-sm transition"
              onClick={async () => {
                setError("");
                const res = await signIn("credentials", {
                  email: email.trim().toLowerCase(),
                  password,
                  redirect: false,
                  callbackUrl: "/admin/dashboard",
                });
                if (res?.error) setError("Invalid credentials.");
                else if (res?.url) window.location.href = res.url;
              }}
            >
              Sign in
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              Demo: <code className="text-slate-400">admin@volta.test</code> /{" "}
              <code className="text-slate-400">demo123</code>
            </p>
          </div>

          <p className="text-center text-sm text-slate-500">
            <Link href="/" className="text-accent hover:underline font-medium">
              ← Back to store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
