import React from "react";
import { Link, useLocation } from "react-router-dom";
import NavDrawer from "./nav-drawer";
import { useMobileNavVisibility } from "@/lib/mobile-visible";
import useMobileBottomNavbar from "@/hooks/useMobileBottomNavbar";
import { NAV_ITEMS } from "../constants";

const MobileBottomNavbar = ({ isActiveRoute }) => {
  const location = useLocation();
  const isMobileNavVisible = useMobileNavVisibility(location.key);
  const { isHidden } = useMobileBottomNavbar();
  const shouldShow = isMobileNavVisible && !isHidden;
  return (
    <nav
      className={`bg-white backdrop-blur-xl shadow-[0_12px_40px_rgba(15,23,42,0.18)] fixed inset-x-0 bottom-0 z-50 px-3 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:hidden ${
        shouldShow
          ? "translate-y-0 delay-0"
          : `pointer-events-none translate-y-[calc(100%+1.5rem)] ${
              isHidden ? "delay-0" : "delay-200"
            }`
      }`}
      aria-label="Primary navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-center justify-items-center gap-1 py-1">
        {NAV_ITEMS.filter((item) => item.isMobile).map((item) => {
          const isActive = isActiveRoute(item.link);
          const Icon = item.mobileIcon;

          return (
            <Link
              key={item.id}
              to={item.link}
              className={`group relative flex h-12 w-[54px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className="size-4 transition-transform group-active:scale-90"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="max-w-full block mt-0.5 truncate text-[10px] font-semibold leading-none">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
        <NavDrawer />
      </div>
    </nav>
  );
};

export default MobileBottomNavbar;
