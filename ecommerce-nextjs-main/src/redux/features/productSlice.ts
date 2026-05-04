import type { IProduct } from "@/types/product";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: IProduct = {
  _id: "",
  prodId: "",
  slug: "",
  imgSrc: "",
  fileKey: "",
  name: "",
  price: "",
  category: "",
  subcategory: "",
};

export const productSlice = createSlice({
  name: "productSlice",
  initialState,
  reducers: {
    setProduct: (state, action: PayloadAction<IProduct>) => {
      return action.payload;
    },
  },
});

export const { setProduct } = productSlice.actions;
export default productSlice.reducer;
