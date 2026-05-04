"use client";

import { useAppSelector } from "@/redux/hooks";
import React, { Dispatch, SetStateAction } from "react";
import { RxCross1 } from "react-icons/rx";
import CartProduct from "./CartProduct";
import Link from "next/link";
import { AiOutlineShoppingCart } from "react-icons/ai";

interface PropsType {
  setShowCart: Dispatch<SetStateAction<boolean>>;
}

const Cart = ({ setShowCart }: PropsType) => {
  const products = useAppSelector((state) => state.cartReducer);

  const getTotal = () => {
    let total = 0;
    products.forEach((item) => (total += item.price * item.quantity));
    return total.toFixed(2);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={() => setShowCart(false)}
    >
      <div
        className="absolute top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AiOutlineShoppingCart className="text-xl text-slate-700" />
            <h3 className="font-semibold text-slate-900">
              Your cart
              {products.length > 0 && (
                <span className="ml-2 text-xs font-bold bg-accent text-white rounded-full px-2 py-0.5">
                  {products.length}
                </span>
              )}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowCart(false)}
            className="rounded-lg p-2 hover:bg-slate-100 text-slate-500 transition"
            aria-label="Close cart"
          >
            <RxCross1 />
          </button>
        </div>

        {/* items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <AiOutlineShoppingCart className="text-6xl text-slate-200" />
              <p className="text-slate-500 font-medium">Your cart is empty</p>
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="text-accent text-sm hover:underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((item) => (
                <CartProduct
                  key={item.id}
                  id={item.id}
                  img={item.img}
                  title={item.title}
                  price={item.price}
                  quantity={item.quantity}
                />
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        {products.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Subtotal</span>
              <span className="font-bold text-xl text-slate-900">${getTotal()}</span>
            </div>
            <p className="text-xs text-slate-400">Shipping calculated at checkout</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/cart" onClick={() => setShowCart(false)}>
                <button className="w-full rounded-xl border-2 border-slate-200 text-slate-800 py-3 font-semibold text-sm hover:border-slate-400 transition">
                  View cart
                </button>
              </Link>
              <Link href="/checkout" onClick={() => setShowCart(false)}>
                <button className="w-full rounded-xl bg-accent text-white py-3 font-semibold text-sm hover:bg-blue-600 transition shadow-lg shadow-accent/25">
                  Checkout
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
