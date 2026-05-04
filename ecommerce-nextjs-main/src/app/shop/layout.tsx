"use client";

import Cart from "@/components/front-end/Cart";
import Footer from "@/components/front-end/Footer";
import Navbar from "@/components/front-end/Navbar";
import { useState } from "react";

/**
 * Shop routes share the same storefront chrome (nav + cart drawer) as the home page.
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const [showCart, setShowCart] = useState(false);
  return (
    <>
      <Navbar setShowCart={setShowCart} />
      {showCart && <Cart setShowCart={setShowCart} />}
      {children}
      <Footer />
    </>
  );
}
