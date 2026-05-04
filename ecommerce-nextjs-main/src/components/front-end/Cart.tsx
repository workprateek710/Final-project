import { useAppSelector } from "@/redux/hooks";
import React, { Dispatch, SetStateAction } from "react";
import { RxCross1 } from "react-icons/rx";
import CartProduct from "./CartProduct";
import Link from "next/link";

interface PropsType {
  setShowCart: Dispatch<SetStateAction<boolean>>;
}

const Cart = ({ setShowCart }: PropsType) => {
  // Retrieve products from the cart in Redux state
  const products = useAppSelector((state) => state.cartReducer);

  // Function to calculate the total cost of items in the cart
  const getTotal = () => {
    let total = 0;
    products.forEach((item) => (total += item.price * item.quantity));
    return total;
  };

  return (
    <div className="bg-[#0000007d] w-full min-h-screen fixed left-0 top-0 z-20 overflow-y-scroll">
      <div className="max-w-[400px] w-full min-h-full bg-white absolute top-0 right-0 p-6">
        <RxCross1
          className="absolute right-0 top-0 m-6 text-[24px] cursor-pointer"
          onClick={() => setShowCart(false)} // Closes the cart overlay
        />
        <h3 className="pt-6 text-lg font-medium text-gray-600 uppercase">
          Your Cart
        </h3>

        {/* Display each product in the cart */}
        <div className="mt-6 space-y-2">
          {products?.map((item) => (
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

        {/* Display the total cost */}
        <div className="flex justify-between items-center font-medium text-xl py-4">
          <p>Total:</p>
          <p>${getTotal()}.00</p>
        </div>

        {/* View Cart Button */}
        <Link href="/cart">
          <button className="bg-black text-white text-center w-full rounded-3xl py-2 hover:bg-accent mb-4 mt-4">
            View Cart
          </button>
        </Link>

        {/* Checkout Button */}
        <Link href="/checkout">
          <button className="bg-black text-white text-center w-full rounded-3xl py-2 hover:bg-accent">
            Checkout
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Cart;
