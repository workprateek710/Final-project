"use client";

import { addToCart } from "@/redux/features/cartSlice";
import { useAppDispatch } from "@/redux/hooks";
import { makeToast } from "@/utils/helper";
import { AiOutlineShoppingCart } from "react-icons/ai";

type Props = {
  prodId: string;
  slug: string;
  name: string;
  imgSrc: string;
  price: number;
  label?: string;
};

export default function AddToCartButton({
  prodId,
  slug,
  name,
  imgSrc,
  price,
  label = "Add to cart",
}: Props) {
  const dispatch = useAppDispatch();
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 bg-pink text-white px-4 py-2 rounded-md hover:bg-accent transition"
      onClick={() => {
        dispatch(
          addToCart({
            id: prodId,
            title: name,
            img: imgSrc,
            price,
            quantity: 1,
            slug,
          })
        );
        makeToast("Added to cart");
      }}
    >
      <AiOutlineShoppingCart />
      {label}
    </button>
  );
}
