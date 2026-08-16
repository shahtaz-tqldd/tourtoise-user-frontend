import React from "react";
import { Outlet } from "react-router-dom";

//components
import LeftSideMenu from "@/components/navbar/side-menu";
import MainHeader from "@/components/navbar/main-header";

// provider
import MobileBottomNavbarProvider from "@/components/navbar/mobile-bottom-navbar-provider";

// hooks
import useInitialTripRedirect from "@/hooks/useInitialTripRedirect";

const MainLayout = () => {
  useInitialTripRedirect();

  return (
    <MobileBottomNavbarProvider>
      <section className="flex">
        <LeftSideMenu />
        <div className="w-full flex flex-col min-h-screen bg-primary/[0.07]">
          <MainHeader />
          <Outlet />
        </div>
      </section>
    </MobileBottomNavbarProvider>
  );
};

export default MainLayout;
