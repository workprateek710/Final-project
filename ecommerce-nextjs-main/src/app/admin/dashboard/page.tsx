"use client";

import Popup from "@/components/admin-panel/Popup";
import ProductRow from "@/components/admin-panel/ProductRow";
import { setLoading } from "@/redux/features/loadingSlice";
import { useAppDispatch } from "@/redux/hooks";
import type { IProduct } from "@/types/product";
import { useEffect, useMemo, useState } from "react";

export type { IProduct };

function productMatchesQuery(product: IProduct, q: string) {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const hay = [
    product.name,
    product.prodId,
    product.slug,
    product.category,
    product.subcategory,
    product.brand,
    product.description,
    product.price,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

const Dashboard = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [search, setSearch] = useState("");
  const [openPopup, setOpenPopup] = useState(false);
  const [updateTable, setUpdateTable] = useState(false);

  const dispatch = useAppDispatch();

  const filteredProducts = useMemo(
    () => products.filter((p) => productMatchesQuery(p, search)),
    [products, search]
  );

  useEffect(() => {
    const fetchProducts = async () => {
      dispatch(setLoading(true));
      try {
        const response = await fetch("/api/get_products", {
          method: "GET", // HTTP method
          cache: "no-store", // Disable caching
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchProducts();
  }, [dispatch, updateTable]);

  return (
    <div>
      <div className="bg-white h-[calc(100vh-96px)] rounded-lg p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl">All Products</h2>
          <label className="block w-full sm:max-w-md">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, product ID, slug, brand, category…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              autoComplete="off"
            />
          </label>
        </div>
        {search.trim() && (
          <p className="mt-2 text-sm text-slate-500">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        )}
        <div className="mt-4 h-[calc(100vh-180px)] overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-500 border-t border-[#ececec]">
                <th>SR No.</th>
                <th>Name</th>
                <th>Price</th>
                <th>Picture</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product: IProduct, index) => (
                <ProductRow
                  key={product._id}
                  srNo={index + 1}
                  setOpenPopup={setOpenPopup}
                  setUpdateTable={setUpdateTable}
                  product={product}
                />
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="py-8 text-center text-slate-500 text-sm">No products loaded.</p>
          )}
          {products.length > 0 && filteredProducts.length === 0 && (
            <p className="py-8 text-center text-slate-500 text-sm">No products match your search.</p>
          )}
        </div>
      </div>
      {openPopup && (
        <Popup setOpenPopup={setOpenPopup} setUpdateTable={setUpdateTable} />
      )}
    </div>
  );
};

export default Dashboard;
