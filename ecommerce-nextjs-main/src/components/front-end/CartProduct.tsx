"use client";

import Link from "next/link";
import { removeFromCart, updateQuantity } from "@/redux/features/cartSlice";
import { useAppDispatch } from "@/redux/hooks";
import React from "react";
import { RxCross1 } from "react-icons/rx";

interface PropsType {
  id: string;
  img: string;
  title: string;
  price: number;
  quantity: number;
  slug?: string;
  onNavigate?: () => void;
}

const CartProduct: React.FC<PropsType> = ({
  id,
  img,
  title,
  price,
  quantity,
  slug,
  onNavigate,
}) => {
  const dispatch = useAppDispatch();
  const productHref = slug ? `/shop/${slug}` : "/shop";
  const setQuantity = (nextQuantity: number) => {
    dispatch(updateQuantity({ id, quantity: Math.max(0, nextQuantity) }));
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition group">
      <Link
        href={productHref}
        onClick={onNavigate}
        className="shrink-0 w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1"
        aria-label={`View ${title}`}
      >
        <img className="w-full h-full object-contain" src={img} alt={title} />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={productHref}
          onClick={onNavigate}
          className="font-medium text-slate-900 text-sm line-clamp-1 hover:text-accent transition"
        >
          {title}
        </Link>
        <div className="mt-2 inline-flex items-center rounded-full border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setQuantity(quantity - 1)}
            className="h-7 w-8 rounded-l-full text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Decrease ${title} quantity`}
          >
            -
          </button>
          <span className="min-w-8 text-center text-xs font-semibold text-slate-800">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="h-7 w-8 rounded-r-full text-slate-600 hover:bg-slate-100"
            aria-label={`Increase ${title} quantity`}
          >
            +
          </button>
        </div>
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
