import type { IProduct } from "@/types/product";
import { setLoading } from "@/redux/features/loadingSlice";
import { setProduct } from "@/redux/features/productSlice";
import { useAppDispatch } from "@/redux/hooks";
import { makeToast } from "@/utils/helper";
import axios from "axios";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin5Line } from "react-icons/ri";

interface PropsType {
  srNo: number;
  setOpenPopup: Dispatch<SetStateAction<boolean>>;
  setUpdateTable: Dispatch<SetStateAction<boolean>>;
  product: IProduct;
}

const ProductRow = ({
  srNo,
  setOpenPopup,
  setUpdateTable,
  product,
}: PropsType) => {
  const dispatch = useAppDispatch();
  const onEdit = () => {
    dispatch(setProduct(product));
    setOpenPopup(true);
  };

  const onDelete = () => {
    dispatch(setLoading(true));
    const afterMongo = async () => {
      try {
        await axios.delete(`/api/delete_product/${product._id}`);
        makeToast("Product deleted successfully");
        setUpdateTable((prevState) => !prevState);
      } catch {
        makeToast("Could not delete product");
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (product.fileKey?.startsWith("local:")) {
      void afterMongo();
      return;
    }
    const endpoint = product.fileKey?.startsWith("localupload:")
      ? "/api/local-upload"
      : "/api/uploadthing";
    const payload = { fileKey: product.fileKey };
    axios.delete(endpoint, { data: payload }).finally(() => {
      void afterMongo();
    });
  };
  return (
    <tr>
      <td>
        <div>{srNo}</div>
      </td>
      <td>
        <div>{product.name}</div>
      </td>
      <td>${product.price}</td>
      <td className="py-2">
        <Image
          src={product.imgSrc}
          width={40}
          height={40}
          alt="product-image"
        />
      </td>
      <td>
        <div className="text-2xl flex items-center gap-2 text-gray-600">
          <CiEdit
            className="cursor-pointer hover:text-black"
            onClick={onEdit}
          />
          <RiDeleteBin5Line
            className="text-[20px] cursor-pointer hover:text-red-600"
            onClick={onDelete}
          />
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;
