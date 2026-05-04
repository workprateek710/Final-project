import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface IProduct {
  id: string;
  title: string;
  img: string;
  price: number;
  quantity: number;
}

const initialState: Array<IProduct> = [];

export const cartSlice = createSlice({
  name: "cartSlice",
  initialState,
  reducers: {
    // Add a product to the cart or update its quantity
    addToCart: (state, action: PayloadAction<IProduct>) => {
      const productIndex = state.findIndex((pro) => pro.id === action.payload.id);

      if (productIndex === -1) {
        // Product doesn't exist in cart, add it
        state.push(action.payload);
      } else {
        // Product exists, update its quantity
        state[productIndex].quantity += action.payload.quantity;
      }
    },

    // Remove a product from the cart by its ID
    removeFromCart: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      return state.filter((item) => item.id !== id);
    },

    // Update the quantity of a specific product
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const productIndex = state.findIndex((item) => item.id === id);

      if (productIndex !== -1 && quantity > 0) {
        state[productIndex].quantity = quantity;
      } else if (productIndex !== -1 && quantity === 0) {
        // If quantity is set to 0, remove the product from the cart
        return state.filter((item) => item.id !== id);
      }
    },

    // Clear all items from the cart
    clearCart: () => {
      return initialState;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
