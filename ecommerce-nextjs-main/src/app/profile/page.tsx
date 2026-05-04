"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "@/components/front-end/Navbar";
import Footer from "@/components/front-end/Footer";

/* ─── types ─────────────────────────────────────────────── */
type Profile = {
  email: string;
  name: string;
  phone: string;
  bio: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  createdAt: string;
};

type PurchaseRow = {
  _id: string;
  prodId: string;
  rating: number;
  createdAt: string;
  product: {
    name: string;
    imgSrc: string;
    price: string;
    slug: string;
    brand?: string;
    subcategory?: string;
  } | null;
};

type Tab = "info" | "shipping" | "orders" | "account";

/* ─── avatar helper ───────────────────────────────────────── */
function avatarInitials(name: string, email: string) {
  const src = name?.trim() || email;
  const parts = src.split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : src.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-pink-500", "bg-amber-500", "bg-cyan-500",
];
function avatarColor(email: string) {
  let h = 0;
  for (const c of email) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

/* ─── Input component ─────────────────────────────────────── */
function Field({
  label, name, value, onChange, type = "text", placeholder = "", readOnly = false,
}: {
  label: string; name: string; value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string; placeholder?: string; readOnly?: boolean;
}) {
  const base = "w-full rounded-xl border px-4 py-3 text-sm transition outline-none";
  const editable = "border-slate-200 bg-slate-50/50 focus:border-accent focus:ring-2 focus:ring-accent/15";
  const ro = "border-slate-100 bg-slate-100 text-slate-500 cursor-default";
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {type === "textarea" ? (
        <textarea
          name={name} value={value} onChange={onChange} readOnly={readOnly}
          placeholder={placeholder} rows={3}
          className={`${base} ${readOnly ? ro : editable} resize-none`}
        />
      ) : (
        <input
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} readOnly={readOnly}
          className={`${base} ${readOnly ? ro : editable}`}
        />
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Omit<Profile, "email" | "createdAt">>({
    name: "", phone: "", bio: "", address: "", city: "", zip: "", country: "",
  });
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [tab, setTab] = useState<Tab>("info");
  const [saving, setSaving] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showCart, setShowCart] = useState(false);

  /* auth guard */
  useEffect(() => {
    const u = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!u) { router.push("/login?redirect=/profile"); return; }
    setUserId(u);
  }, [router]);

  /* fetch profile */
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/profile?email=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((data: Profile) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          bio: data.bio || "",
          address: data.address || "",
          city: data.city || "",
          zip: data.zip || "",
          country: data.country || "",
        });
      })
      .catch(() => toast.error("Could not load profile."));
  }, [userId]);

  /* fetch orders when tab opens */
  useEffect(() => {
    if (tab !== "orders" || !userId) return;
    setLoadingOrders(true);
    fetch(`/api/purchases/mine?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((d) => setPurchases(d.purchases ?? []))
      .catch(() => toast.error("Could not load orders."))
      .finally(() => setLoadingOrders(false));
  }, [tab, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const saveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userId, ...form }),
      });
      if (!res.ok) throw new Error();
      const { user } = await res.json();
      setProfile((p) => ({ ...p!, ...user }));
      toast.success("Profile saved!");
    } catch {
      toast.error("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error('Type DELETE to confirm.');
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userId, confirm: "DELETE" }),
      });
      if (!res.ok) throw new Error();
      localStorage.removeItem("user");
      toast.success("Account deleted.");
      router.push("/");
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  /* stats */
  const totalSpent = purchases.reduce(
    (sum, p) => sum + (Number.parseFloat(p.product?.price ?? "0") || 0),
    0
  );
  const uniqueItems = new Set(purchases.map((p) => p.prodId)).size;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar setShowCart={setShowCart} />
        <div className="flex items-center justify-center h-64">
          <div className="loader" />
        </div>
      </div>
    );
  }

  const initials = avatarInitials(profile.name, profile.email);
  const color = avatarColor(profile.email);

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "info",     label: "Personal info",   icon: "👤" },
    { id: "shipping", label: "Saved address",   icon: "📦" },
    { id: "orders",   label: "Order history",   icon: "🧾" },
    { id: "account",  label: "Account",         icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar setShowCart={setShowCart} />

      {/* hero header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container py-10 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className={`${color} w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shadow-lg shrink-0`}>
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profile.name || "Your Profile"}</h1>
            <p className="text-slate-400 text-sm mt-1">{profile.email}</p>
            {profile.bio && <p className="text-slate-300 text-sm mt-1 max-w-md">{profile.bio}</p>}
          </div>
          <div className="sm:ml-auto grid grid-cols-3 gap-6 text-center shrink-0">
            <div>
              <p className="text-2xl font-bold">{purchases.length}</p>
              <p className="text-slate-400 text-xs mt-0.5">Purchases</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{uniqueItems}</p>
              <p className="text-slate-400 text-xs mt-0.5">Unique items</p>
            </div>
            <div>
              <p className="text-2xl font-bold">${totalSpent.toFixed(0)}</p>
              <p className="text-slate-400 text-xs mt-0.5">Total spent</p>
            </div>
          </div>
        </div>

        {/* tab bar */}
        <div className="container">
          <div className="flex gap-1 overflow-x-auto pb-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  tab === t.id
                    ? "border-accent text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* tab content */}
      <main className="container py-8 max-w-2xl flex-1">

        {/* ── Personal Info ── */}
        {tab === "info" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">Personal information</h2>
              <p className="text-slate-500 text-sm mt-0.5">Update your name, phone, and bio.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" name="name" value={form.name} onChange={handleChange} placeholder="Alex Smith" />
              <Field label="Email" name="email" value={profile.email} type="email" readOnly />
              <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 000 0000" />
              <div className="sm:col-span-2">
                <Field label="Bio" name="bio" value={form.bio} onChange={handleChange} type="textarea" placeholder="Tell us a little about yourself…" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400">Member since {memberSince}</p>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-accent text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition shadow-lg shadow-accent/20"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        )}

        {/* ── Shipping Address ── */}
        {tab === "shipping" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">Saved shipping address</h2>
              <p className="text-slate-500 text-sm mt-0.5">This is auto-filled at checkout so you don&#39;t have to retype it.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Street address" name="address" value={form.address} onChange={handleChange} placeholder="123 Main St" />
              </div>
              <Field label="City" name="city" value={form.city} onChange={handleChange} placeholder="New York" />
              <Field label="ZIP / Postal code" name="zip" value={form.zip} onChange={handleChange} placeholder="10001" />
              <div className="sm:col-span-2">
                <Field label="Country" name="country" value={form.country} onChange={handleChange} placeholder="United States" />
              </div>
            </div>
            {form.address && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-800 flex items-start gap-2">
                <span className="text-lg">✓</span>
                <span>Address saved — it will auto-fill next time you checkout.</span>
              </div>
            )}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-accent text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition shadow-lg shadow-accent/20"
              >
                {saving ? "Saving…" : "Save address"}
              </button>
            </div>
          </div>
        )}

        {/* ── Order History ── */}
        {tab === "orders" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 text-lg">Order history</h2>
              <p className="text-slate-500 text-sm mt-0.5">Every item you&#39;ve purchased — newest first.</p>
            </div>

            {loadingOrders ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4">
                    <div className="skeleton w-16 h-16 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : purchases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                <p className="text-4xl mb-3">🛍️</p>
                <p className="text-slate-600 font-medium">No purchases yet</p>
                <Link href="/shop" className="inline-block mt-3 text-accent text-sm hover:underline">
                  Browse the shop →
                </Link>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
                  {purchases.map((p) => (
                    <div key={p._id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition">
                      <div className="relative w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {p.product?.imgSrc ? (
                          <Image src={p.product.imgSrc} alt={p.product.name} fill className="object-contain p-1" sizes="64px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {p.product ? (
                          <Link href={`/shop/${p.product.slug}`} className="font-semibold text-slate-900 hover:text-accent text-sm line-clamp-1 transition">
                            {p.product.name}
                          </Link>
                        ) : (
                          <p className="text-slate-400 text-sm italic">Product removed</p>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">
                          {p.product?.brand && <span className="mr-2">{p.product.brand}</span>}
                          {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <div className="flex items-center gap-0.5 mt-1 text-amber-400 text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < p.rating ? "opacity-100" : "opacity-20"}>★</span>
                          ))}
                        </div>
                      </div>
                      {p.product?.price && (
                        <span className="font-bold text-slate-900 shrink-0">${p.product.price}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total spent across {purchases.length} purchases</p>
                    <p className="text-2xl font-bold mt-0.5">${totalSpent.toFixed(2)}</p>
                  </div>
                  <Link href="/shop" className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">
                    Shop more →
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Account / Danger Zone ── */}
        {tab === "account" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
              <h2 className="font-semibold text-slate-900 text-lg">Account details</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-slate-400 text-xs mb-0.5">Email</p>
                  <p className="font-medium text-slate-800">{profile.email}</p>
                </div>
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-slate-400 text-xs mb-0.5">Member since</p>
                  <p className="font-medium text-slate-800">{memberSince}</p>
                </div>
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-slate-400 text-xs mb-0.5">Total purchases</p>
                  <p className="font-medium text-slate-800">{purchases.length} items</p>
                </div>
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-slate-400 text-xs mb-0.5">Total spent</p>
                  <p className="font-medium text-slate-800">${totalSpent.toFixed(2)}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => { localStorage.removeItem("user"); router.push("/"); }}
                  className="text-sm text-slate-500 hover:text-slate-800 font-medium transition"
                >
                  Sign out →
                </button>
              </div>
            </div>

            {/* danger zone */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-red-600 text-lg flex items-center gap-2">
                  <span>⚠️</span> Danger zone
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Permanently delete your account and all purchase history. This cannot be undone.
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Type <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-600 font-bold">DELETE</code> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className="w-full rounded-xl border border-red-200 bg-red-50/30 px-4 py-3 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-400/15 outline-none"
                  />
                </div>
                <button
                  onClick={deleteAccount}
                  disabled={deleting || deleteConfirm !== "DELETE"}
                  className="w-full rounded-xl bg-red-600 text-white py-3 font-semibold text-sm hover:bg-red-700 disabled:opacity-40 transition"
                >
                  {deleting ? "Deleting account…" : "Delete my account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
