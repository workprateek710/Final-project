import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Use localStorage for persistence
import { combineReducers } from "redux";
import cartReducer from "./features/cartSlice";
import loadingReducer from "./features/loadingSlice";
import productReducer from "./features/productSlice";

// Combine all reducers into a rootReducer
const rootReducer = combineReducers({
  cartReducer,
  productReducer,
  loadingReducer,
});

// Persist configuration
const persistConfig = {
  key: "root",
  storage, // Store Redux state in the browser's localStorage
  whitelist: ["cartReducer"], // Specify which reducers to persist (only cartReducer in this case)
};

// Wrap the rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with middleware adjustments
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== "production", // Enable dev tools in development mode
});

// Persistor for redux-persist
export const persistor = persistStore(store);

// Types for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
