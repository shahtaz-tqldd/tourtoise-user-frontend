import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import NavDrawer from "./nav-drawer";
import { useMobileNavVisibility } from "@/lib/mobile-visible";
import useMobileBottomNavbar from "@/hooks/useMobileBottomNavbar";
import { NAV_ITEMS, isNavItemActive } from "./nav-config";

const GRID_COLUMNS = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

const MobileBottomNav = () => {
  const location = useLocation();
  const isActiveRoute = (link) => isNavItemActive(link, location.pathname);
  const isMobileNavVisible = useMobileNavVisibility(location.key);
  const { isHidden } = useMobileBottomNavbar();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const shouldShow = isMobileNavVisible && !isHidden;
  const visibleItems = NAV_ITEMS.filter(
    (item) => item.isMobile && (isAuthenticated || !item.hideForGuests),
  );
  const gridColumns =
    GRID_COLUMNS[visibleItems.length + 1] || GRID_COLUMNS[5];
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
      <div
        className={`mx-auto grid max-w-md items-center justify-items-center gap-1 py-1 ${gridColumns}`}
      >
        {visibleItems.map((item) => {
          const isActive = isActiveRoute(item.link);
          const Icon = item.mobileIcon;

          return (
            <Link
              key={item.id}
              to={item.link}
              className={`group relative flex h-12 w-[54px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                isActive
                  ? "bg-accent text-primary"
                  : "text-body hover:bg-surface-muted hover:text-heading"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className="size-4 transition-transform group-active:scale-90"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="max-w-full block mt-0.5 truncate text-3xs font-semibold leading-none">
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

export default MobileBottomNav;
