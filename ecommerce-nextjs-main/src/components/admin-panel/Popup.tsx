import { setLoading } from "@/redux/features/loadingSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  ELECTRONICS_SUBCATEGORIES,
  PRIMARY_CATEGORY,
} from "@/constants/productCategories";
import { makeToast } from "@/utils/helper";
import axios from "axios";
import Image from "next/image";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";

interface PropsType {
  setOpenPopup: Dispatch<SetStateAction<boolean>>;
  setUpdateTable: Dispatch<SetStateAction<boolean>>;
}

const Popup = ({ setOpenPopup, setUpdateTable }: PropsType) => {
  const productData = useAppSelector((state) => state.productReducer);
  const dispatch = useAppDispatch();
  const [inputData, setInputData] = useState({
    name: productData.name,
    category: productData.category || PRIMARY_CATEGORY,
    subcategory: productData.subcategory || "General",
    price: productData.price,
    imgSrc: productData.imgSrc,
    fileKey: productData.fileKey,
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const { data } = await axios.post("/api/local-upload", formData);
      setInputData((prev) => ({
        ...prev,
        imgSrc: data.url,
        fileKey: data.fileKey,
      }));
      makeToast("Image uploaded.");
    } catch (error) {
      const message =
        axios.isAxiosError(error) && typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Image upload failed";
      makeToast(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    const oldFileKey = productData.fileKey;
    const newFileKey = inputData.fileKey;
    axios
      .put(`/api/edit_product/${productData._id}`, inputData)
      .then(() => {
        if (oldFileKey && newFileKey && oldFileKey !== newFileKey) {
          const cleanupEndpoint = oldFileKey.startsWith("localupload:")
            ? "/api/local-upload"
            : "/api/uploadthing";
          axios.delete(cleanupEndpoint, { data: { fileKey: oldFileKey } }).catch(() => {
            // best-effort cleanup only; do not block successful product update
          });
        }
        makeToast("Product updated successfully");
        setUpdateTable((prevState) => !prevState);
      })
      .catch(() => makeToast("Could not update product"))
      .finally(() => {
        dispatch(setLoading(false));
        setOpenPopup(false);
      });
  };
  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-[#00000070] grid place-items-center">
      <div className="bg-white w-[700px] py-8 rounded-lg text-center relative ">
        <IoIosCloseCircle
          className="absolute text-2xl right-0 top-0 m-4 cursor-pointer hover:text-red-600"
          onClick={() => setOpenPopup(false)}
        />
        <h2 className="text-2xl -mt-3">Edit Products</h2>
        <form className="mt-6 w-fit space-y-4 mx-auto" onSubmit={handleSubmit}>
          <Image
            className="max-h-[220px] w-auto object-contain rounded-md mx-auto"
            src={inputData.imgSrc || "/placeholder.jpg"}
            width={360}
            height={220}
            alt="product_image"
          />
          <div className="text-left">
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
          <input
            className="border block border-gray-500 outline-none px-4 py-2 rounded-lg w-fit"
            type="text"
            placeholder="Name"
            value={inputData.name}
            onChange={(e) =>
              setInputData({ ...inputData, name: e.target.value })
            }
            required
          />
          <select
            className="border block border-gray-500 outline-none px-4 py-2 rounded-lg w-fit"
            value={inputData.category}
            onChange={(e) =>
              setInputData({ ...inputData, category: e.target.value })
            }
            required
          >
            <option value={PRIMARY_CATEGORY}>{PRIMARY_CATEGORY}</option>
          </select>
          <select
            className="border block border-gray-500 outline-none px-4 py-2 rounded-lg w-fit"
            value={inputData.subcategory}
            onChange={(e) =>
              setInputData({ ...inputData, subcategory: e.target.value })
            }
            required
          >
            {ELECTRONICS_SUBCATEGORIES.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
          <input
            className="border block border-gray-500 outline-none px-4 py-2 rounded-lg w-fit"
            type="text"
            placeholder="Price"
            value={inputData.price}
            onChange={(e) =>
              setInputData({ ...inputData, price: e.target.value })
            }
            required
          />
          <div className="flex justify-end">
            <button
              className="bg-blue-500 text-white px-8 py-2 rounded-lg self-center disabled:opacity-60"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Popup;
