import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, isNavItemActive } from "./nav-config";

/** Horizontal primary navigation shown in the header from `md` up. */
const TopNav = ({ className }) => {
  const pathname = usePathname();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <nav aria-label="Primary" className={cn("hidden shrink-0 md:block", className)}>
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.filter(
          (item) => item.inTopNav && (isAuthenticated || !item.hideForGuests),
        ).map((item) => {
          const isActive = isNavItemActive(item.link, pathname);
          const isLocked = item.requiresAuth && !isAuthenticated;
          const Icon = item.mobileIcon;

          return (
            <li key={item.id}>
              <Link
                href={item.link}
                aria-current={isActive ? "page" : undefined}
                title={isLocked ? "Sign in required" : undefined}
                className={cn(
                  "relative flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-body-sm font-semibold transition-colors xl:px-4",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  isActive
                    ? "bg-accent text-primary"
                    : "text-body hover:bg-surface-muted hover:text-heading",
                )}
              >
                <Icon
                  className="hidden size-4 2xl:block"
                  strokeWidth={isActive ? 2.4 : 2}
                  aria-hidden="true"
                />
                <span className="xl:hidden">{item.shortLabel}</span>
                <span className="hidden xl:inline">{item.label}</span>
                {isLocked && (
                  <Lock className="size-3 text-faint" aria-hidden="true" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TopNav;
