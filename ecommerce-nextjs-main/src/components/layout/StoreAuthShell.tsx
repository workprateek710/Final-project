"use client";

import Cart from "@/components/front-end/Cart";
import Footer from "@/components/front-end/Footer";
import Navbar from "@/components/front-end/Navbar";
import { useState } from "react";

export default function StoreAuthShell({ children }: { children: React.ReactNode }) {
  const [showCart, setShowCart] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar setShowCart={setShowCart} />
      {showCart && <Cart setShowCart={setShowCart} />}
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
