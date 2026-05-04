import React, { useState, useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { store } from "../src/redux/store";
import "./checkout.css";
import Navbar from "../src/components/front-end/Navbar";
import Footer from "../src/components/front-end/Footer";
import "../src/app/globals.css";
import axios from "axios";
import { clearCart } from "../src/redux/features/cartSlice";
import { useDispatch } from "react-redux";
import Link from "next/link";

const steps = ["Cart", "Shipping", "Payment", "Review"];

const CheckoutContent = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    zip: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
  });
  const [step, setStep] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const products = useSelector((state) => state.cartReducer);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getTotal = () => products.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!products.length) {
      alert("Your cart is empty.");
      return;
    }
    const userId = typeof window !== "undefined" ? localStorage.getItem("user") || "guest" : "guest";
    setSubmitting(true);
    try {
      await axios.post("/api/purchases", {
        userId,
        items: products.map((p) => ({
          prodId: p.id,
          rating: 5,
          quantity: p.quantity,
        })),
      });
      dispatch(clearCart());
      alert("Order placed — purchases saved in MongoDB. Thank you!");
      window.location.href = "/";
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Could not complete checkout. Is MongoDB running?");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <Navbar setShowCart={() => {}} />

      <main className="flex-1 container py-10 md:py-14 max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-8 md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Volta checkout</p>
            <h1 className="text-2xl md:text-3xl font-bold">Secure checkout</h1>
            <p className="text-slate-400 text-sm mt-2">
              Demo only — no real card processing. Orders write to MongoDB for trending + recommendations.
            </p>
          </div>

          <div className="px-6 py-6 md:px-10 md:py-8">
            <div className="flex flex-wrap gap-2 mb-10">
              {steps.map((label, i) => (
                <div
                  key={label}
                  className={`flex-1 min-w-[72px] text-center text-xs font-semibold py-2 rounded-lg border transition ${
                    step === i + 1
                      ? "border-accent bg-accent/10 text-accent"
                      : step > i + 1
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 text-slate-400"
                  }`}
                >
                  {i + 1}. {label}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
                {products.length === 0 ? (
                  <p className="text-slate-600 text-sm">
                    Your cart is empty.{" "}
                    <Link href="/shop" className="text-accent font-semibold hover:underline">
                      Browse the shop
                    </Link>
                  </p>
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
                <button
                  type="button"
                  disabled={!products.length}
                  onClick={handleNextStep}
                  className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-accent disabled:opacity-40 transition"
                >
                  Continue to shipping
                </button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Shipping</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Full name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Street address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">ZIP</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-accent transition">
                    Continue
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Payment (demo)</h2>
                <p className="text-xs text-slate-500">Do not enter real card data.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Card number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none"
                      placeholder="4242 4242 4242 4242"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Expiry</label>
                      <input
                        type="text"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-accent transition">
                    Review order
                  </button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Review & place order</h2>
                <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {products.map((item) => (
                    <li key={item.id} className="flex justify-between p-4 text-sm">
                      <span className="text-slate-700">
                        {item.title} × {item.quantity}
                      </span>
                      <span className="font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-100 pt-4">
                  <span>Total</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={submitting || !products.length}
                    onClick={handleSubmit}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-40 transition"
                  >
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
  <Provider store={store}>
    <CheckoutContent />
  </Provider>
);

export default Checkout;
