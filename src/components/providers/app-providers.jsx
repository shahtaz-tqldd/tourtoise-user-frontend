"use client";

import { Provider } from "react-redux";
import { Toaster } from "sonner";

import { store } from "@/store";
import RootLayout from "@/layouts/root-layout";

/** Redux + app-wide client providers mounted from the root server layout. */
const AppProviders = ({ children }) => (
  <Provider store={store}>
    <RootLayout>{children}</RootLayout>
    <Toaster />
  </Provider>
);

export default AppProviders;
