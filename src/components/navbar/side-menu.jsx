import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { Logo } from "../shared/utils";
import {
  ChatIcon,
  MapIcon,
  NoteIcon,
  SaveIcon,
} from "@/assets/icons/svg-icons";
import { getInitials } from "@/lib/utils";

const PRIMARY_COLOR = "#009966";
const DEFAULT_ICON_COLOR = "#1C274C";

const LeftSideMenu = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useSelector((state) => state.auth);
  const fullName = user?.name || "Guest User";
  const email = user?.email || "Signed in";
  const username = user?.username;
  const profileImage = user?.avatar_url;
  const profilePath = `/profile/${username || "my-profile"}`;

  const navItems = [
    {
      id: 1,
      label: "Tour Destinations",
      shortLabel: "Explore",
      link: "/",
      icon: ({ isActive }) => (
        <MapIcon
          size={5}
          color={isActive ? PRIMARY_COLOR : DEFAULT_ICON_COLOR}
        />
      ),
    },
    {
      id: 2,
      label: "My Trips",
      shortLabel: "Trips",
      link: "/trips",
      icon: ({ isActive }) => (
        <NoteIcon
          size={5}
          color={isActive ? PRIMARY_COLOR : DEFAULT_ICON_COLOR}
        />
      ),
    },
    {
      id: 3,
      label: "Tour Agent",
      shortLabel: "Agent",
      link: "/agent-chat",
      icon: ({ isActive }) => (
        <ChatIcon
          size={5}
          color={isActive ? PRIMARY_COLOR : DEFAULT_ICON_COLOR}
        />
      ),
    },
    {
      id: 5,
      label: "Saved Destinations",
      shortLabel: "Saved",
      link: "/destinations/saved-destination",
      icon: ({ isActive }) => (
        <SaveIcon
          size={5}
          color={isActive ? PRIMARY_COLOR : DEFAULT_ICON_COLOR}
        />
      ),
    },
  ];

  const isActiveRoute = (link) => {
    if (link === "/") {
      return pathname === "/";
    }

    return pathname === link || pathname.startsWith(`${link}/`);
  };

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[300px] border-r border-slate-200 bg-white md:flex">
        <div className="flex min-h-0 w-full flex-col px-4 py-5">
          <div className="px-2">
            <Logo />
          </div>

        <div className="mt-7 space-y-2">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Menu
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
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

        <Link
          to={profilePath}
          className="mt-auto flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-primary/25 hover:bg-primary/5"
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt=""
              className="size-11 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-2 ring-white">
              {getInitials(fullName)}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-950">
              {fullName}
            </span>
            <span className="block truncate text-xs text-slate-500">
              {username ? `@${username}` : email}
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-slate-400" />
        </Link>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-center gap-1">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.link);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                to={item.link}
                className={`relative flex min-w-0 items-center justify-center rounded-2xl transition ${
                  isActive
                    ? ""
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
                aria-label={item.label}
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-xl transition ${
                    isActive ? "bg-white shadow-sm" : "bg-transparent"
                  }`}
                >
                  <Icon isActive={isActive} />
                </span>
                <span className="sr-only">{item.shortLabel}</span>
              </Link>
            );
          })}
          <Link
            to={profilePath}
            className={`relative flex items-center justify-center rounded-2xl py-1 transition ${
              isActiveRoute(profilePath)
                ? "bg-primary/10"
                : "hover:bg-slate-50"
            }`}
            aria-label="Profile"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt=""
                className={`size-7 rounded-full object-cover ring-2 ${
                  isActiveRoute(profilePath)
                    ? "ring-primary/30"
                    : "ring-slate-100"
                }`}
              />
            ) : (
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                  isActiveRoute(profilePath)
                    ? "bg-primary text-white"
                    : "bg-primary/15 text-primary"
                }`}
              >
                {getInitials(fullName)}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </>
  );
};

export default LeftSideMenu;
