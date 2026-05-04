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
  // Retrieve the cart products from the Redux store
  const products = useSelector((state) => state.cartReducer);

  // State to track if the component has mounted
  const [isMounted, setIsMounted] = useState(false);

  // State to toggle cart visibility
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    // Set the mounted state to true once the component has mounted
    setIsMounted(true);
  }, []);

  // Calculate the total cost of items in the cart
  const getTotal = () => {
    return products.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Prevent rendering until the component has mounted
  if (!isMounted) return null;

  return (
    <div className="page-wrapper">
      {/* Navbar Component with setShowCart passed as a prop */}
      <Navbar setShowCart={setShowCart} />

      {/* Main Cart Content */}
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

        {products.length > 0 ? (
          <div className="space-y-4">
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

            <div className="flex justify-between items-center mt-6 font-medium text-lg">
              <p>Total:</p>
              <p>${getTotal()}.00</p>
            </div>

            <Link href="/checkout">
              <button className="bg-black text-white w-full py-2 rounded-lg mt-4">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        ) : (
          <p>Your cart is empty.</p>
        )}
      </main>

      {/* Footer Component */}
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
