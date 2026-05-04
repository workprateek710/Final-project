"use client";
import { setLoading } from "@/redux/features/loadingSlice";
import { useAppDispatch } from "@/redux/hooks";
import {
  ELECTRONICS_SUBCATEGORIES,
  PRIMARY_CATEGORY,
} from "@/constants/productCategories";
import { makeToast } from "@/utils/helper";
import axios from "axios";
import Image from "next/image";
import React, { FormEvent, useState } from "react";

interface IPayload {
  imgSrc: null | string;
  fileKey: null | string;
  name: string;
  category: string;
  subcategory: string;
  price: string;
}

const emptyPayload: IPayload = {
  imgSrc: null,
  fileKey: null,
  name: "",
  category: PRIMARY_CATEGORY,
  subcategory: "General",
  price: "",
};

const ProductForm = () => {
  const [payLoad, setPayLoad] = useState<IPayload>(emptyPayload);
  const [uploading, setUploading] = useState(false);
  const dispatch = useAppDispatch();

  const handleImageUpload = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      makeToast("Image must be 4MB or smaller.");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Could not read image file."));
        reader.readAsDataURL(file);
      });
      setPayLoad((prev) => ({
        ...prev,
        imgSrc: dataUrl,
        fileKey: `inline:${Date.now()}`,
      }));
      makeToast("Image uploaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed";
      makeToast(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!payLoad.imgSrc || !payLoad.fileKey) {
      makeToast("Please upload a product image first.");
      return;
    }
    dispatch(setLoading(true));
    try {
      await axios.post("/api/add_product", payLoad);
      makeToast("Product added successfully");
      setPayLoad(emptyPayload);
    } catch {
      makeToast("Could not add product");
    } finally {
      dispatch(setLoading(false));
    }
  };
  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Image
        className="max-h-[300px] w-auto object-contain rounded-md"
        src={payLoad.imgSrc ? payLoad.imgSrc : "/placeholder.jpg"}
        width={800}
        height={500}
        alt="product_image"
      />
      <div>
        <label className="block ml-1 mb-1">Product Image (max 4MB)</label>
        <input
          className="block w-full"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void handleImageUpload(file);
            }
          }}
        />
        {uploading && <p className="text-sm text-gray-500 mt-1">Uploading image...</p>}
      </div>
      <div>
        <label className="block ml-1">Product Name</label>
        <input
          className="bg-gray-300 w-full px-4 py-2 border outline-pink rounded-md"
          type="text"
          value={payLoad.name}
          onChange={(e) => setPayLoad({ ...payLoad, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block ml-1">Product Category</label>
        <select
          className="bg-gray-300 w-full px-4 py-2 border outline-pink rounded-md"
          value={payLoad.category}
          onChange={(e) => setPayLoad({ ...payLoad, category: e.target.value })}
          required
        >
          <option value={PRIMARY_CATEGORY}>{PRIMARY_CATEGORY}</option>
        </select>
      </div>
      <div>
        <label className="block ml-1">Electronics Subcategory</label>
        <select
          className="bg-gray-300 w-full px-4 py-2 border outline-pink rounded-md"
          value={payLoad.subcategory}
          onChange={(e) => setPayLoad({ ...payLoad, subcategory: e.target.value })}
          required
        >
          {ELECTRONICS_SUBCATEGORIES.map((subcategory) => (
            <option key={subcategory} value={subcategory}>
              {subcategory}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block ml-1">Product Price</label>
        <input
          className="bg-gray-300 w-full px-4 py-2 border outline-pink rounded-md"
          type="text"
          value={payLoad.price}
          onChange={(e) => setPayLoad({ ...payLoad, price: e.target.value })}
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          className="bg-pink text-white px-8 py-2 rounded-md disabled:opacity-60"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Add"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
