import React, { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Legacy route: old storefront linked here. Keeps bookmarks working.
 */
export default function SmartphoneRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/shop?subcategory=Phones");
  }, [router]);
  return <p className="p-8 text-center text-gray-600">Redirecting to phones…</p>;
}
