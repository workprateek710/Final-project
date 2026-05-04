// pages/cart.js
import React, { useState, useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { store } from "../src/redux/store";
import CartProduct from "../src/components/front-end/CartProduct";
import Navbar from "../src/components/front-end/Navbar";
import Footer from "../src/components/front-end/Footer";
import Link from "next/link";
import "../src/app/globals.css";

const CartPage = () => {
  const products = useSelector((state) => state.cartReducer);
  const [isMounted, setIsMounted] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getTotal = () =>
    products.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) {
      window.location.href = "/login?redirect=/checkout";
    } else {
      window.location.href = "/checkout";
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar setShowCart={setShowCart} />

      <main className="flex-1 container py-10 max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Cart</h1>

        {products.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {products.map((item) => (
                <div key={item.id} className="p-4">
                  <CartProduct
                    id={item.id}
                    img={item.img}
                    title={item.title}
                    price={item.price}
                    quantity={item.quantity}
                  />
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-600 font-medium">Subtotal</span>
                <span className="text-xl font-bold text-slate-900">${getTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold hover:bg-blue-600 transition shadow-lg shadow-accent/25"
              >
                Proceed to checkout
              </button>
              <Link href="/shop" className="block text-center text-sm text-slate-500 hover:text-accent mt-3 transition">
                Continue shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-slate-600 font-medium mb-4">Your cart is empty</p>
            <Link href="/shop" className="inline-flex items-center justify-center rounded-xl bg-accent text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-600 transition">
              Browse products
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

// Wrap the CartPage component in the Redux Provider
const CartPageWithProvider = () => (
  <Provider store={store}>
    <CartPage />
  </Provider>
);

export default CartPageWithProvider;
