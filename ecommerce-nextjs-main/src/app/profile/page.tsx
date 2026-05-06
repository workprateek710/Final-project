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
  email: string; name: string; phone: string; bio: string;
  address: string; city: string; zip: string; country: string;
  createdAt: string;
};
type SavedAddress = { _id: string; label: string; name: string; address: string; city: string; zip: string; country: string; };
type SavedPayment = { _id: string; label: string; cardholderName: string; cardLast4: string; expiry: string; cardType: string; };
type PurchaseRow = { _id: string; prodId: string; rating?: number; createdAt: string; product: { name: string; imgSrc: string; price: string; slug: string; brand?: string; } | null; };
type Tab = "info" | "addresses" | "payments" | "orders" | "account";

/* ─── helpers ────────────────────────────────────────────── */
function initials(name: string, email: string) {
  const src = name?.trim() || email;
  const p = src.split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : src.slice(0, 2).toUpperCase();
}
const COLORS = ["bg-violet-500","bg-blue-500","bg-emerald-500","bg-pink-500","bg-amber-500","bg-cyan-500"];
function avatarColor(email: string) {
  let h = 0; for (const c of email) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}
function cardIcon(type: string) {
  return { visa: "💳", mastercard: "💳", amex: "💳", discover: "💳" }[type] ?? "💳";
}
const CARD_LABELS: Record<string, string> = { visa: "Visa", mastercard: "Mastercard", amex: "Amex", discover: "Discover", card: "Card" };

/* ─── sub-components ─────────────────────────────────────── */
function Field({ label, name, value, onChange, type = "text", placeholder = "", readOnly = false }:
  { label: string; name: string; value: string; onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; placeholder?: string; readOnly?: boolean; }) {
  const base = "w-full rounded-xl border px-4 py-3 text-sm transition outline-none";
  const editable = "border-slate-200 bg-slate-50/50 focus:border-accent focus:ring-2 focus:ring-accent/15";
  const ro = "border-slate-100 bg-slate-100 text-slate-500 cursor-default";
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {type === "textarea"
        ? <textarea name={name} value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder} rows={3} className={`${base} ${readOnly ? ro : editable} resize-none`} />
        : <input type={type} name={name} value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder} className={`${base} ${readOnly ? ro : editable}`} />}
    </div>
  );
}

const emptyAddr = () => ({ label: "", name: "", address: "", city: "", zip: "", country: "" });
const emptyPay  = () => ({ label: "", cardholderName: "", cardNumber: "", expiry: "" });

/* ─── Page ────────────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", bio: "", address: "", city: "", zip: "", country: "" });
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [payments, setPayments]   = useState<SavedPayment[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [tab, setTab] = useState<Tab>("info");
  const [saving, setSaving] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  // showCart state kept for Navbar prop contract
  const [, setShowCart] = useState(false);

  // Address form state
  const [addrForm, setAddrForm] = useState(emptyAddr());
  const [editingAddr, setEditingAddr] = useState<string | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);

  // Payment form state
  const [payForm, setPayForm] = useState(emptyPay());
  const [editingPay, setEditingPay] = useState<string | null>(null);
  const [showPayForm, setShowPayForm] = useState(false);

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
      .then(r => r.json()).then((d: Profile) => {
        setProfile(d);
        setForm({ name: d.name||"", phone: d.phone||"", bio: d.bio||"", address: d.address||"", city: d.city||"", zip: d.zip||"", country: d.country||"" });
      }).catch(() => toast.error("Could not load profile."));
    fetch(`/api/profile/addresses?email=${encodeURIComponent(userId)}`).then(r => r.json()).then(d => setAddresses(d.addresses ?? [])).catch(() => {});
    fetch(`/api/profile/payments?email=${encodeURIComponent(userId)}`).then(r => r.json()).then(d => setPayments(d.payments ?? [])).catch(() => {});
  }, [userId]);

  /* fetch orders when tab opens */
  useEffect(() => {
    if (tab !== "orders" || !userId) return;
    setLoadingOrders(true);
    fetch(`/api/purchases/mine?userId=${encodeURIComponent(userId)}`).then(r => r.json()).then(d => setPurchases(d.purchases ?? [])).catch(() => toast.error("Could not load orders.")).finally(() => setLoadingOrders(false));
  }, [tab, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const saveProfile = async () => {
    if (!userId) return; setSaving(true);
    try {
      const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userId, ...form }) });
      if (!res.ok) throw new Error();
      const { user } = await res.json();
      setProfile(p => ({ ...p!, ...user }));
      toast.success("Profile saved!");
    } catch { toast.error("Save failed."); } finally { setSaving(false); }
  };

  /* ── Address CRUD ── */
  const saveAddress = async () => {
    if (!userId) return; setSaving(true);
    try {
      if (editingAddr) {
        const res = await fetch(`/api/profile/addresses/${editingAddr}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userId, ...addrForm }) });
        const d = await res.json(); setAddresses(d.addresses);
        toast.success("Address updated!");
      } else {
        const res = await fetch("/api/profile/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userId, ...addrForm }) });
        const d = await res.json(); setAddresses(d.addresses);
        toast.success("Address saved!");
      }
      setShowAddrForm(false); setEditingAddr(null); setAddrForm(emptyAddr());
    } catch { toast.error("Save failed."); } finally { setSaving(false); }
  };

  const deleteAddress = async (id: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/profile/addresses/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userId }) });
      const d = await res.json(); setAddresses(d.addresses);
      toast.success("Address removed.");
    } catch { toast.error("Delete failed."); }
  };

  const startEditAddr = (a: SavedAddress) => {
    setAddrForm({ label: a.label, name: a.name, address: a.address, city: a.city, zip: a.zip, country: a.country });
    setEditingAddr(a._id); setShowAddrForm(true);
  };

  /* ── Payment CRUD ── */
  const savePayment = async () => {
    if (!userId) return; setSaving(true);
    try {
      if (editingPay) {
        const res = await fetch(`/api/profile/payments/${editingPay}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userId, label: payForm.label, cardholderName: payForm.cardholderName, expiry: payForm.expiry, cardNumber: payForm.cardNumber }) });
        if (!res.ok) throw new Error();
        const d = await res.json(); setPayments(d.payments);
        toast.success("Payment updated!");
      } else {
        const res = await fetch("/api/profile/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userId, ...payForm }) });
        if (!res.ok) throw new Error();
        const d = await res.json(); setPayments(d.payments);
        toast.success("Card saved!");
      }
      setShowPayForm(false); setEditingPay(null); setPayForm(emptyPay());
    } catch { toast.error("Save failed."); } finally { setSaving(false); }
  };

  const deletePayment = async (id: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/profile/payments/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userId }) });
      if (!res.ok) throw new Error();
      const d = await res.json(); setPayments(d.payments);
      toast.success("Card removed.");
    } catch { toast.error("Delete failed."); }
  };

  const startEditPay = (p: SavedPayment) => {
    if (!p._id) {
      toast.error("This saved card is missing an ID. Refresh and try again.");
      return;
    }
    setPayForm({ label: p.label, cardholderName: p.cardholderName, cardNumber: `•••• •••• •••• ${p.cardLast4}`, expiry: p.expiry });
    setEditingPay(p._id); setShowPayForm(true);
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== "DELETE") { toast.error("Type DELETE to confirm."); return; }
    setDeleting(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userId, confirm: "DELETE" }) });
      if (!res.ok) throw new Error();
      localStorage.removeItem("user"); toast.success("Account deleted."); router.push("/");
    } catch { toast.error("Delete failed."); } finally { setDeleting(false); }
  };

  const totalSpent = purchases.reduce((s, p) => s + (Number.parseFloat(p.product?.price ?? "0") || 0), 0);
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—";

  if (!profile) return (
    <div className="min-h-screen bg-slate-50"><Navbar setShowCart={setShowCart} />
      <div className="flex items-center justify-center h-64"><div className="loader" /></div>
    </div>
  );

  const av = initials(profile.name, profile.email);
  const color = avatarColor(profile.email);

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "info",      label: "Personal info",   icon: "👤" },
    { id: "addresses", label: "Addresses",        icon: "🏠" },
    { id: "payments",  label: "Payment methods",  icon: "💳" },
    { id: "orders",    label: "Order history",    icon: "🧾" },
    { id: "account",   label: "Account",          icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar setShowCart={setShowCart} />

      {/* header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container py-10 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className={`${color} w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-lg shrink-0`}>{av}</div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profile.name || "Your Profile"}</h1>
            <p className="text-slate-400 text-sm mt-1">{profile.email}</p>
            {profile.bio && <p className="text-slate-300 text-sm mt-1 max-w-md">{profile.bio}</p>}
          </div>
          <div className="sm:ml-auto grid grid-cols-3 gap-6 text-center shrink-0">
            <div><p className="text-2xl font-bold">{purchases.length}</p><p className="text-slate-400 text-xs">Purchases</p></div>
            <div><p className="text-2xl font-bold">{addresses.length}</p><p className="text-slate-400 text-xs">Addresses</p></div>
            <div><p className="text-2xl font-bold">${totalSpent.toFixed(0)}</p><p className="text-slate-400 text-xs">Total spent</p></div>
          </div>
        </div>
        <div className="container">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${tab === t.id ? "border-accent text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container py-8 max-w-2xl flex-1">

        {/* ── Personal Info ── */}
        {tab === "info" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div><h2 className="font-semibold text-slate-900 text-lg">Personal information</h2><p className="text-slate-500 text-sm mt-0.5">Update your name, phone, and bio.</p></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" name="name" value={form.name} onChange={handleChange} placeholder="Alex Smith" />
              <Field label="Email" name="email" value={profile.email} type="email" readOnly />
              <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 000 0000" />
              <div className="sm:col-span-2"><Field label="Bio" name="bio" value={form.bio} onChange={handleChange} type="textarea" placeholder="Tell us a little about yourself…" /></div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400">Member since {memberSince}</p>
              <button onClick={saveProfile} disabled={saving} className="rounded-xl bg-accent text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition shadow-lg shadow-accent/20">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        )}

        {/* ── Addresses ── */}
        {tab === "addresses" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900 text-lg">Saved addresses</h2>
                <p className="text-slate-500 text-sm mt-0.5">Auto-filled at checkout. Add labels like &quot;Home&quot; or &quot;Work&quot;.</p>
              </div>
              <button onClick={() => { setAddrForm(emptyAddr()); setEditingAddr(null); setShowAddrForm(true); }}
                className="rounded-xl bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-blue-600 transition shrink-0">
                + Add address
              </button>
            </div>

            {/* add/edit form */}
            {showAddrForm && (
              <div className="bg-white rounded-2xl border border-accent/30 shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-slate-900">{editingAddr ? "Edit address" : "New address"}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Label (e.g. Home, Work)" name="label" value={addrForm.label} onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))} placeholder="Home" />
                  <Field label="Recipient name" name="name" value={addrForm.name} onChange={e => setAddrForm(f => ({ ...f, name: e.target.value }))} placeholder="Alex Smith" />
                  <div className="sm:col-span-2"><Field label="Street address" name="address" value={addrForm.address} onChange={e => setAddrForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St" /></div>
                  <Field label="City" name="city" value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} placeholder="New York" />
                  <Field label="ZIP" name="zip" value={addrForm.zip} onChange={e => setAddrForm(f => ({ ...f, zip: e.target.value }))} placeholder="10001" />
                  <div className="sm:col-span-2"><Field label="Country" name="country" value={addrForm.country} onChange={e => setAddrForm(f => ({ ...f, country: e.target.value }))} placeholder="United States" /></div>
                </div>
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button onClick={() => { setShowAddrForm(false); setEditingAddr(null); }} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
                  <button onClick={saveAddress} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition">
                    {saving ? "Saving…" : editingAddr ? "Update address" : "Save address"}
                  </button>
                </div>
              </div>
            )}

            {/* list */}
            {addresses.length === 0 && !showAddrForm ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                <p className="text-4xl mb-2">🏠</p>
                <p className="text-slate-500 text-sm">No saved addresses yet.</p>
              </div>
            ) : addresses.map(a => (
              <div key={a._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/8 text-accent flex items-center justify-center text-xl shrink-0">🏠</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{a.label || "Address"}</span>
                    </div>
                    {a.name && <p className="text-sm text-slate-600">{a.name}</p>}
                    <p className="text-sm text-slate-500">{[a.address, a.city, a.zip, a.country].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEditAddr(a)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-accent hover:text-accent transition">Edit</button>
                  <button onClick={() => deleteAddress(a._id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Payment Methods ── */}
        {tab === "payments" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900 text-lg">Payment methods</h2>
                <p className="text-slate-500 text-sm mt-0.5">Only the last 4 digits and expiry are stored. CVV is never saved.</p>
              </div>
              <button onClick={() => { setPayForm(emptyPay()); setEditingPay(null); setShowPayForm(true); }}
                className="rounded-xl bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-blue-600 transition shrink-0">
                + Add card
              </button>
            </div>

            {showPayForm && (
              <div className="bg-white rounded-2xl border border-accent/30 shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-slate-900">{editingPay ? "Edit card" : "Add new card"}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><Field label="Card nickname (e.g. Personal Visa, Work Amex)" name="label" value={payForm.label} onChange={e => setPayForm(f => ({ ...f, label: e.target.value }))} placeholder="Personal Visa" /></div>
                  <div className="sm:col-span-2"><Field label="Cardholder name" name="cardholderName" value={payForm.cardholderName} onChange={e => setPayForm(f => ({ ...f, cardholderName: e.target.value }))} placeholder="Alex Smith" /></div>
                  <div className="sm:col-span-2"><Field label={editingPay ? "Card number (leave masked to keep same)" : "Card number (demo — do not use real cards)"} name="cardNumber" value={payForm.cardNumber} onChange={e => setPayForm(f => ({ ...f, cardNumber: e.target.value }))} placeholder="4242 4242 4242 4242" /></div>
                  <Field label="Expiry (MM/YY)" name="expiry" value={payForm.expiry} onChange={e => setPayForm(f => ({ ...f, expiry: e.target.value }))} placeholder="12/26" />
                </div>
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button onClick={() => { setShowPayForm(false); setEditingPay(null); }} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
                  <button onClick={savePayment} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition">
                    {saving ? "Saving…" : editingPay ? "Update card" : "Save card"}
                  </button>
                </div>
              </div>
            )}

            {payments.length === 0 && !showPayForm ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                <p className="text-4xl mb-2">💳</p>
                <p className="text-slate-500 text-sm">No saved payment methods yet.</p>
              </div>
            ) : payments.map(p => (
              <div key={p._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {CARD_LABELS[p.cardType] ?? "Card"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{p.label || "Card"}</span>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{cardIcon(p.cardType)} •••• {p.cardLast4}</span>
                    </div>
                    <p className="text-sm text-slate-500">{p.cardholderName} · Expires {p.expiry}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEditPay(p)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-accent hover:text-accent transition">Edit</button>
                  <button onClick={() => deletePayment(p._id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition">Delete</button>
                </div>
              </div>
            ))}
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
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4">
                  <div className="skeleton w-16 h-16 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-3 w-1/2" /></div>
                </div>
              ))}</div>
            ) : purchases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <p className="text-4xl mb-3">🛍️</p>
                <p className="text-slate-600 font-medium">No purchases yet</p>
                <Link href="/shop" className="inline-block mt-3 text-accent text-sm hover:underline">Browse the shop →</Link>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
                  {purchases.map(p => (
                    <div key={p._id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition">
                      <div className="relative w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {p.product?.imgSrc ? <Image src={p.product.imgSrc} alt={p.product.name} fill className="object-contain p-1" sizes="64px" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        {p.product ? <Link href={`/shop/${p.product.slug}`} className="font-semibold text-slate-900 hover:text-accent text-sm line-clamp-1 transition">{p.product.name}</Link> : <p className="text-slate-400 text-sm italic">Product removed</p>}
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                        {p.rating ? (
                          <div className="flex gap-0.5 mt-1 text-amber-400 text-xs">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < p.rating! ? "opacity-100" : "opacity-20"}>★</span>)}</div>
                        ) : (
                          <p className="text-xs text-slate-400 mt-1">Not rated yet</p>
                        )}
                      </div>
                      {p.product?.price && <span className="font-bold text-slate-900 shrink-0">${p.product.price}</span>}
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
                  <div><p className="text-sm text-slate-400">{purchases.length} purchases</p><p className="text-2xl font-bold mt-0.5">${totalSpent.toFixed(2)} total</p></div>
                  <Link href="/shop" className="bg-accent text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">Shop more →</Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Account ── */}
        {tab === "account" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
              <h2 className="font-semibold text-slate-900 text-lg">Account details</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {[["Email", profile.email], ["Member since", memberSince], ["Saved addresses", String(addresses.length)], ["Saved cards", String(payments.length)]].map(([k, v]) => (
                  <div key={k} className="bg-slate-50 rounded-xl px-4 py-3"><p className="text-slate-400 text-xs mb-0.5">{k}</p><p className="font-medium text-slate-800">{v}</p></div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button onClick={() => { localStorage.removeItem("user"); router.push("/"); }} className="text-sm text-slate-500 hover:text-slate-800 font-medium transition">Sign out →</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-red-600 text-lg flex items-center gap-2">⚠️ Danger zone</h2>
              <p className="text-slate-500 text-sm">
                Permanently delete your account, saved addresses, and saved cards. Past orders and reviews remain stored without your profile. This cannot be undone.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Type <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-600 font-bold">DELETE</code> to confirm</label>
                  <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE" className="w-full rounded-xl border border-red-200 bg-red-50/30 px-4 py-3 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-400/15 outline-none" />
                </div>
                <button onClick={deleteAccount} disabled={deleting || deleteConfirm !== "DELETE"} className="w-full rounded-xl bg-red-600 text-white py-3 font-semibold text-sm hover:bg-red-700 disabled:opacity-40 transition">
                  {deleting ? "Deleting…" : "Delete my account"}
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
