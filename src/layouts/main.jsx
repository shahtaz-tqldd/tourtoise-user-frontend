import React from "react";
import { Outlet } from "react-router-dom";
import LeftSideMenu from "@/components/navbar/side-menu";
import MainHeader from "@/components/navbar/main-header";
import MobileBottomNavbarProvider from "@/components/navbar/mobile-bottom-navbar-provider";
import useInitialTripRedirect from "@/hooks/useInitialTripRedirect";

const MainLayout = () => {
  useInitialTripRedirect();

  return (
    <MobileBottomNavbarProvider>
      <main className="bg-primary/5 min-h-screen flex">
        <LeftSideMenu />
        <div className="w-full">
          <MainHeader />
          <div className="mx-auto w-full max-w-7xl px-4 md:pb-0">
            <Outlet />
          </div>
        </div>
      </main>
    </MobileBottomNavbarProvider>
  );
};

export default MainLayout;
