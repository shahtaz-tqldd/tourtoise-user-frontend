import React from "react";
import { Outlet } from "react-router-dom";
import LeftSideMenu from "@/components/navbar/side-menu";
import MainHeader from "@/components/navbar/main-header";

const MainLayout = () => {
  return (
    <main className="bg-primary/5 min-h-screen flex">
      <LeftSideMenu />
      <div className="mx-auto w-full max-w-7xl">
        <MainHeader />
        <div className="px-4">
          <Outlet />
        </div>
      </div>
    </main>
  );
};

export default MainLayout;
