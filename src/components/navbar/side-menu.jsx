import React from "react";
import { Link, useLocation } from "react-router-dom";

import { Logo } from "../shared/utils";
import ProfileBar from "./components/profile-bar";
import MobileBottomNavbar from "./components/mobile-bottom-navbar";
import { NAV_ITEMS } from "./constants";

const LeftSideMenu = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isActiveRoute = (link) => {
    if (link === "/") {
      return pathname === "/" || pathname.startsWith("/destinations/");
    }

    return pathname === link || pathname.startsWith(`${link}/`);
  };

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[360px] border-r border-slate-200 bg-white md:flex">
        <div className="flex min-h-0 w-full flex-col px-4 py-5">
          <div className="px-2">
            <Logo />
          </div>

          <div className="mt-7 space-y-2">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Menu
            </p>
            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = isActiveRoute(item.link);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    to={item.link}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition ${
                        isActive
                          ? "bg-white shadow-sm ring-1 ring-primary/10"
                          : "bg-slate-50 group-hover:bg-white"
                      }`}
                    >
                      <Icon isActive={isActive} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <ProfileBar />
        </div>
      </aside>
      <MobileBottomNavbar isActiveRoute={isActiveRoute} />
    </>
  );
};

export default LeftSideMenu;
