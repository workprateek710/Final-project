import { setLoading } from "@/redux/features/loadingSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { makeToast } from "@/utils/helper";
import { UploadButton } from "@/utils/uploadthing";
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
    category: productData.category,
    price: productData.price,
    imgSrc: productData.imgSrc,
    fileKey: productData.fileKey,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    const oldFileKey = productData.fileKey;
    const newFileKey = inputData.fileKey;
    axios
      .put(`/api/edit_product/${productData._id}`, inputData)
      .then(() => {
        if (
          oldFileKey &&
          newFileKey &&
          oldFileKey !== newFileKey &&
          !oldFileKey.startsWith("local:")
        ) {
          axios.delete("/api/uploadthing", { data: { fileKey: oldFileKey } }).catch(() => {
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
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              setInputData((prev) => ({
                ...prev,
                imgSrc: res[0]?.url || prev.imgSrc,
                fileKey: res[0]?.key || prev.fileKey,
              }));
            }}
            onUploadError={() => {
              makeToast("Image upload failed");
            }}
          />
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
          <input
            className="border block border-gray-500 outline-none px-4 py-2 rounded-lg w-fit"
            type="text"
            placeholder="Category"
            value={inputData.category}
            onChange={(e) =>
              setInputData({ ...inputData, category: e.target.value })
            }
            required
          />
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
            <button className="bg-blue-500 text-white px-8 py-2 rounded-lg self-center">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Popup;
