"use client";

import { removeFromCart } from "@/redux/features/cartSlice";
import { useAppDispatch } from "@/redux/hooks";
import React from "react";
import { RxCross1 } from "react-icons/rx";

interface PropsType {
  id: string;
  img: string;
  title: string;
  price: number;
  quantity: number;
}

const CartProduct: React.FC<PropsType> = ({ id, img, title, price, quantity }) => {
  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition group">
      <div className="shrink-0 w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1">
        <img className="w-full h-full object-contain" src={img} alt={title} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 text-sm line-clamp-1">{title}</p>
        <p className="text-slate-500 text-xs mt-0.5">Qty: {quantity}</p>
        <p className="text-accent font-bold text-sm mt-0.5">${(price * quantity).toFixed(2)}</p>
      </div>

      <button
        type="button"
        onClick={() => dispatch(removeFromCart(id))}
        className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
        aria-label="Remove item"
      >
        <RxCross1 className="text-xs" />
      </button>
    </div>
  );
};

export default CartProduct;
