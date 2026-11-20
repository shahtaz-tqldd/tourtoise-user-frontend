"use client";

import React from "react";

import AppHeader from "@/components/layout/app-header";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import MobileBottomNavbarProvider from "@/components/layout/mobile-bottom-navbar-provider";
import useInitialTripRedirect from "@/hooks/useInitialTripRedirect";

/**
 * Main app shell: sticky top navigation on desktop, bottom tab bar on mobile.
 * Public and member pages share it; navigation adapts to the signed-in state.
 */
const AppLayout = ({ children }) => {
  useInitialTripRedirect();

  return (
    <MobileBottomNavbarProvider>
      <div className="flex min-h-dvh w-full min-w-0 flex-col bg-canvas">
        <AppHeader />
        {children}
      </div>
      <MobileBottomNav />
    </MobileBottomNavbarProvider>
  );
};

export default AppLayout;
