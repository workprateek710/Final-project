import React, { useState, useEffect } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "../src/redux/store";
import "./checkout.css";
import Navbar from "../src/components/front-end/Navbar";
import Footer from "../src/components/front-end/Footer";
import "../src/app/globals.css";
import axios from "axios";
import { clearCart } from "../src/redux/features/cartSlice";
import Link from "next/link";
import { PasswordInput } from "../src/components/ui/PasswordInput";

const steps = ["Cart", "Shipping", "Payment", "Review"];

const CARD_LABELS = { visa: "Visa", mastercard: "Mastercard", amex: "Amex", discover: "Discover", card: "Card" };

function inferCardType(num) {
  const n = (num || "").replace(/\s/g, "");
  if (n.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (n.startsWith("6")) return "discover";
  return "card";
}

/* small helper: read-only info row */
function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-400 w-28 shrink-0">{label}</span>
      <span className="text-slate-900 font-medium">{value}</span>
    </div>
  );
}

/* saved-item picker card */
function SavedPicker({ items, selected, onSelect, renderItem, emptyText, onAddNew }) {
  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        items.map((item) => (
          <button
            key={item._id}
            type="button"
            onClick={() => onSelect(item)}
            className={`w-full text-left rounded-xl border px-4 py-3 transition ${
              selected === item._id
                ? "border-accent bg-accent/6 ring-2 ring-accent/20"
                : "border-slate-200 hover:border-accent/50"
            }`}
          >
            {renderItem(item)}
          </button>
        ))
      )}
      <button
        type="button"
        onClick={onAddNew}
        className="w-full text-left rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-accent hover:text-accent transition"
      >
        + Enter a different address
      </button>
    </div>
  );
}

const CheckoutContent = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.cartReducer);

  const [step, setStep] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // saved lists
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [savedPayments, setSavedPayments] = useState([]);

  // selected saved items
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [selectedPayId, setSelectedPayId] = useState(null);

  // shipping form
  const [shippingForm, setShippingForm] = useState({ name: "", address: "", city: "", zip: "", country: "" });
  const [saveAddr, setSaveAddr] = useState(false);
  const [addrLabel, setAddrLabel] = useState("Home");
  const [useManualAddr, setUseManualAddr] = useState(false);

  // payment form
  const [payForm, setPayForm] = useState({ cardholderName: "", cardNumber: "", expirationDate: "", cvv: "" });
  const [savePay, setSavePay] = useState(false);
  const [payLabel, setPayLabel] = useState("My Card");
  const [useManualPay, setUseManualPay] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) { window.location.href = "/login?redirect=/checkout"; return; }
    setUserId(user);
    setAuthChecked(true);

    // load profile + saved lists
    fetch(`/api/profile?email=${encodeURIComponent(user)}`).then(r => r.json()).then(profile => {
      setShippingForm(f => ({ ...f, name: profile.name || "", address: profile.address || "", city: profile.city || "", zip: profile.zip || "" }));
    }).catch(() => {});

    fetch(`/api/profile/addresses?email=${encodeURIComponent(user)}`).then(r => r.json()).then(d => {
      const list = d.addresses ?? [];
      setSavedAddresses(list);
      if (list.length > 0) { prefillAddr(list[0]); setSelectedAddrId(list[0]._id); }
      else setUseManualAddr(true);
    }).catch(() => setUseManualAddr(true));

    fetch(`/api/profile/payments?email=${encodeURIComponent(user)}`).then(r => r.json()).then(d => {
      const list = d.payments ?? [];
      setSavedPayments(list);
      if (list.length > 0) {
        const p0 = list[0];
        setSelectedPayId(p0._id);
        setPayForm((f) => ({
          ...f,
          cardholderName: p0.cardholderName || "",
          expirationDate: p0.expiry || "",
          cvv: p0.cvv || "",
        }));
      } else setUseManualPay(true);
    }).catch(() => setUseManualPay(true));
  }, []);

  function prefillAddr(a) {
    setShippingForm({ name: a.name || "", address: a.address || "", city: a.city || "", zip: a.zip || "", country: a.country || "" });
  }

  const getTotal = () => products.reduce((t, i) => t + i.price * i.quantity, 0);

  const handleShipChange = (e) => setShippingForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePayChange  = (e) => setPayForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSelectAddr = (a) => { setSelectedAddrId(a._id); prefillAddr(a); setUseManualAddr(false); };
  const handleManualAddr = () => { setSelectedAddrId(null); setShippingForm({ name: "", address: "", city: "", zip: "", country: "" }); setUseManualAddr(true); };

  const handleSelectPay = (p) => {
    setSelectedPayId(p._id);
    setPayForm((f) => ({
      ...f,
      cardholderName: p.cardholderName || "",
      expirationDate: p.expiry || "",
      cvv: p.cvv || "",
    }));
    setUseManualPay(false);
  };
  const handleManualPay = () => { setSelectedPayId(null); setPayForm({ cardholderName: "", cardNumber: "", expirationDate: "", cvv: "" }); setUseManualPay(true); };

  const saveAddressToProfile = async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/profile/addresses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userId, label: addrLabel, ...shippingForm }),
      });
      const d = await res.json();
      setSavedAddresses(d.addresses ?? []);
    } catch { /* non-fatal */ }
  };

  const savePaymentToProfile = async () => {
    if (!userId) return;
    try {
      await fetch("/api/profile/payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userId,
          label: payLabel,
          cardholderName: payForm.cardholderName,
          cardNumber: payForm.cardNumber,
          expiry: payForm.expirationDate,
          cvv: payForm.cvv,
        }),
      });
    } catch { /* non-fatal */ }
  };

  const handleShippingNext = async (e) => {
    e.preventDefault();
    if (saveAddr && useManualAddr) await saveAddressToProfile();
    setStep(3);
  };

  const handlePaymentNext = async (e) => {
    e.preventDefault();
    if (savePay && useManualPay) await savePaymentToProfile();
    setStep(4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!products.length) { alert("Your cart is empty."); return; }
    setSubmitting(true);
    try {
      await axios.post("/api/purchases", {
        userId,
        items: products.map((p) => ({ prodId: p.id, quantity: p.quantity })),
      });
      dispatch(clearCart());
      alert("Order placed! Thank you for your purchase.");
      window.location.href = "/profile";
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Could not complete checkout. Please try again.");
    } finally { setSubmitting(false); }
  };

  if (!isMounted || !authChecked) return null;

  const inputCls = "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none transition";
  const labelCls = "block text-xs font-medium text-slate-600 mb-1.5";

  // selected saved payment for review display
  const savedPay = savedPayments.find(p => p._id === selectedPayId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <Navbar setShowCart={() => {}} />
      <main className="flex-1 container py-10 md:py-14 max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-8 md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Volta checkout</p>
            <h1 className="text-2xl md:text-3xl font-bold">Secure checkout</h1>
            <p className="text-slate-400 text-sm mt-2">Demo only — no real card processing. Orders are saved to MongoDB.</p>
          </div>

          {/* step indicators */}
          <div className="px-6 pt-6 md:px-10">
            <div className="flex flex-wrap gap-2 mb-8">
              {steps.map((label, i) => (
                <div key={label} className={`flex-1 min-w-[72px] text-center text-xs font-semibold py-2 rounded-lg border transition ${
                  step === i + 1 ? "border-accent bg-accent/10 text-accent"
                    : step > i + 1 ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 text-slate-400"}`}>
                  {i + 1}. {label}
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-8 md:px-10">

            {/* ── Step 1: Cart ── */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
                {products.length === 0 ? (
                  <p className="text-slate-600 text-sm">Your cart is empty. <Link href="/shop" className="text-accent font-semibold hover:underline">Browse the shop</Link></p>
                ) : (
                  <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {products.map((item) => (
                      <li key={item.id} className="flex gap-4 p-4 bg-slate-50/50">
                        <img src={item.img} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900">{item.title}</p>
                          <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                          <p className="text-accent font-bold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-slate-600 font-medium">Total</span>
                  <span className="text-2xl font-bold text-slate-900">${getTotal().toFixed(2)}</span>
                </div>
                <button type="button" disabled={!products.length} onClick={() => setStep(2)}
                  className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-accent disabled:opacity-40 transition">
                  Continue to shipping
                </button>
              </div>
            )}

            {/* ── Step 2: Shipping ── */}
            {step === 2 && (
              <form onSubmit={handleShippingNext} className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Shipping address</h2>

                {/* saved address picker */}
                {savedAddresses.length > 0 && !useManualAddr && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Saved addresses</p>
                    {savedAddresses.map(a => (
                      <button key={a._id} type="button" onClick={() => handleSelectAddr(a)}
                        className={`w-full text-left rounded-xl border px-4 py-3 transition ${selectedAddrId === a._id ? "border-accent bg-accent/6 ring-2 ring-accent/20" : "border-slate-200 hover:border-accent/50"}`}>
                        <span className="font-semibold text-slate-900 text-sm">{a.label || "Address"}</span>
                        {a.name && <span className="text-slate-500 text-sm ml-2">({a.name})</span>}
                        <p className="text-slate-500 text-xs mt-0.5">{[a.address, a.city, a.zip, a.country].filter(Boolean).join(", ")}</p>
                      </button>
                    ))}
                    <button type="button" onClick={handleManualAddr}
                      className="w-full text-left rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-accent hover:text-accent transition">
                      + Use a different address
                    </button>
                  </div>
                )}

                {/* manual form — always shown if no saved or user chose manual */}
                {(useManualAddr || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <button type="button" onClick={() => { setUseManualAddr(false); if (savedAddresses[0]) handleSelectAddr(savedAddresses[0]); }}
                        className="text-xs text-accent hover:underline">← Use saved address</button>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Full name</label>
                        <input type="text" name="name" value={shippingForm.name} onChange={handleShipChange} className={inputCls} required />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Street address</label>
                        <input type="text" name="address" value={shippingForm.address} onChange={handleShipChange} className={inputCls} required />
                      </div>
                      <div>
                        <label className={labelCls}>City</label>
                        <input type="text" name="city" value={shippingForm.city} onChange={handleShipChange} className={inputCls} required />
                      </div>
                      <div>
                        <label className={labelCls}>ZIP</label>
                        <input type="text" name="zip" value={shippingForm.zip} onChange={handleShipChange} className={inputCls} required />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Country</label>
                        <input type="text" name="country" value={shippingForm.country} onChange={handleShipChange} className={inputCls} />
                      </div>
                    </div>

                    {/* save address option */}
                    <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={saveAddr} onChange={e => setSaveAddr(e.target.checked)} className="w-4 h-4 accent-blue-500 rounded" />
                        <span className="text-sm text-slate-700 font-medium">Save this address for future checkouts</span>
                      </label>
                      {saveAddr && (
                        <div>
                          <label className={labelCls}>Address nickname (e.g. Home, Work)</label>
                          <input type="text" value={addrLabel} onChange={e => setAddrLabel(e.target.value)} placeholder="Home" className={inputCls} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* show pre-filled summary when using saved */}
                {!useManualAddr && selectedAddrId && (
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-1">
                    <InfoRow label="Name" value={shippingForm.name} />
                    <InfoRow label="Address" value={shippingForm.address} />
                    <InfoRow label="City" value={shippingForm.city} />
                    <InfoRow label="ZIP" value={shippingForm.zip} />
                    <InfoRow label="Country" value={shippingForm.country} />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Back</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-accent transition">Continue to payment</button>
                </div>
              </form>
            )}

            {/* ── Step 3: Payment ── */}
            {step === 3 && (
              <form onSubmit={handlePaymentNext} className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Payment <span className="text-slate-400 text-sm font-normal">(demo — no real processing)</span></h2>

                {/* saved payments picker */}
                {savedPayments.length > 0 && !useManualPay && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Saved cards</p>
                    {savedPayments.map(p => (
                      <button key={p._id} type="button" onClick={() => handleSelectPay(p)}
                        className={`w-full text-left rounded-xl border px-4 py-3 transition ${selectedPayId === p._id ? "border-accent bg-accent/6 ring-2 ring-accent/20" : "border-slate-200 hover:border-accent/50"}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-7 rounded bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {CARD_LABELS[p.cardType] ?? "Card"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{p.label}</p>
                            <p className="text-xs text-slate-500">{p.cardholderName} · •••• {p.cardLast4} · Exp {p.expiry}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                    <button type="button" onClick={handleManualPay}
                      className="w-full text-left rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-accent hover:text-accent transition">
                      + Use a different card
                    </button>

                    {/* CVV required even for saved card */}
                    {selectedPayId && (
                      <div>
                        <label className={labelCls}>CVV</label>
                        <PasswordInput
                          name="cvv"
                          maxLength={4}
                          inputMode="numeric"
                          value={payForm.cvv}
                          onChange={handlePayChange}
                          placeholder="123"
                          visibilityLabel="CVV"
                          required
                          inputClassName={inputCls}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* manual card form */}
                {(useManualPay || savedPayments.length === 0) && (
                  <div className="space-y-4">
                    {savedPayments.length > 0 && (
                      <button type="button" onClick={() => { setUseManualPay(false); if (savedPayments[0]) handleSelectPay(savedPayments[0]); }}
                        className="text-xs text-accent hover:underline">← Use saved card</button>
                    )}
                    <div>
                      <label className={labelCls}>Cardholder name</label>
                      <input type="text" name="cardholderName" value={payForm.cardholderName} onChange={handlePayChange} placeholder="Alex Smith" className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>Card number (demo — do not use real cards)</label>
                      <input type="text" name="cardNumber" value={payForm.cardNumber} onChange={handlePayChange} placeholder="4242 4242 4242 4242" className={inputCls} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Expiry</label>
                        <input type="text" name="expirationDate" value={payForm.expirationDate} onChange={handlePayChange} placeholder="MM/YY" className={inputCls} required />
                      </div>
                      <div>
                        <label className={labelCls}>CVV</label>
                        <PasswordInput
                          name="cvv"
                          maxLength={4}
                          inputMode="numeric"
                          value={payForm.cvv}
                          onChange={handlePayChange}
                          placeholder="123"
                          visibilityLabel="CVV"
                          required
                          inputClassName={inputCls}
                        />
                      </div>
                    </div>

                    {/* save payment option */}
                    <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={savePay} onChange={e => setSavePay(e.target.checked)} className="w-4 h-4 accent-blue-500 rounded" />
                        <span className="text-sm text-slate-700 font-medium">Save this card for future checkouts</span>
                      </label>
                      {savePay && (
                        <div>
                          <label className={labelCls}>Card nickname (e.g. Personal Visa, Work Amex)</label>
                          <input type="text" value={payLabel} onChange={e => setPayLabel(e.target.value)} placeholder="My Card" className={inputCls} />
                        </div>
                      )}
                      <p className="text-xs text-slate-400">
                        Demo checkout: last 4 digits, expiry, and CVV are stored in MongoDB so you don&apos;t have to re-enter them. Never use real card data.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Back</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-accent transition">Review order</button>
                </div>
              </form>
            )}

            {/* ── Step 4: Review ── */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Review &amp; place order</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Shipping to</p>
                    <InfoRow label="Name"    value={shippingForm.name} />
                    <InfoRow label="Address" value={shippingForm.address} />
                    <InfoRow label="City"    value={shippingForm.city} />
                    <InfoRow label="ZIP"     value={shippingForm.zip} />
                    <InfoRow label="Country" value={shippingForm.country} />
                  </div>
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Payment</p>
                    {savedPay && !useManualPay ? (
                      <>
                        <InfoRow label="Card" value={`${savedPay.label} (•••• ${savedPay.cardLast4})`} />
                        <InfoRow label="Name" value={savedPay.cardholderName} />
                        <InfoRow label="Expiry" value={savedPay.expiry} />
                        <InfoRow label="CVV" value={payForm.cvv ? "•".repeat(Math.min(payForm.cvv.length, 4)) : ""} />
                      </>
                    ) : (
                      <>
                        <InfoRow label="Name" value={payForm.cardholderName} />
                        <InfoRow label="Card" value={payForm.cardNumber ? `•••• ${payForm.cardNumber.replace(/\s/g,"").slice(-4)}` : ""} />
                        <InfoRow label="Expiry" value={payForm.expirationDate} />
                        <InfoRow label="CVV" value={payForm.cvv ? "•".repeat(Math.min(payForm.cvv.length, 4)) : ""} />
                      </>
                    )}
                  </div>
                </div>

                <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {products.map((item) => (
                    <li key={item.id} className="flex justify-between p-4 text-sm">
                      <span className="text-slate-700">{item.title} × {item.quantity}</span>
                      <span className="font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-100 pt-4">
                  <span>Total</span><span>${getTotal().toFixed(2)}</span>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(3)} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Back</button>
                  <button type="button" disabled={submitting || !products.length} onClick={handleSubmit}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-40 transition">
                    {submitting ? "Placing order…" : "Place order"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Checkout = () => (
  <Provider store={store}><CheckoutContent /></Provider>
);

export default Checkout;
