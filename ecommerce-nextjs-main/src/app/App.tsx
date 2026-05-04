"use client";
import { store, persistor } from "@/redux/store"; // Import persistor from the updated store
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react"; // Import PersistGate for state persistence
import { ReactNode } from "react";

interface AppProps {
  children: ReactNode;
}

const App = ({ children }: AppProps) => {
  return (
    <Provider store={store}>
      {/* PersistGate ensures the app waits until the persisted state is rehydrated */}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default App;
