import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { resetApiState } from "@/features/api/apiSlice";
import { userLoggedOut } from "@/features/auth/authSlice";
import ProfileBar from "./profile-bar";

import { getCloudinaryPreviewUrl, getInitials } from "@/lib/utils";
import { Title } from "@/components/ui/typography";
import { DRAWER_MENU_ITEMS } from "../constants";

const NavDrawer = () => {
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const username = user?.username;
  const fullName = user?.name;
  const profilePath = `/profile/${username || "my-profile"}`;
  const profileImage = user?.avatar_url;
  const isProfileActive = location.pathname === profilePath;

  const handleLogout = () => {
    setOpen(false);
    dispatch(userLoggedOut());
    dispatch(resetApiState());
    navigate("/login", { replace: true });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={`group relative flex size-10 min-w-0 items-center justify-center rounded-full border-0 p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
            isProfileActive ? "bg-primary/10" : "hover:bg-slate-100/80"
          }`}
          aria-label="Open profile menu"
          aria-current={isProfileActive ? "page" : undefined}
        >
          {profileImage ? (
            <img
              src={getCloudinaryPreviewUrl(profileImage, 36)}
              alt=""
              className={`size-8 rounded-full object-cover ring-2 transition-transform group-active:scale-90 ${
                isProfileActive ? "ring-primary/30" : "ring-slate-100"
              }`}
            />
          ) : (
            <span
              className={`size-8 center rounded-full text-xs font-bold transition-transform group-active:scale-90 ${
                isProfileActive
                  ? "bg-primary text-white"
                  : "bg-primary/15 text-primary"
              }`}
            >
              {getInitials(fullName)}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        showDragHandle={false}
        className="w-screen gap-0 overflow-hidden border-l-0 p-0 md:hidden bg-white"
      >
        <SheetTitle className="sr-only">Profile menu</SheetTitle>
        <SheetDescription className="sr-only">
          View your profile, saved items, and account settings.
        </SheetDescription>
        <div className="flex flex-col h-full w-full bg-gradient-to-br from-emerald-50 via-amber-50/25 to-cyan-50">
          <header className="z-10 border-b border-slate-200 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="mb-4 flex h-10 items-center gap-2">
              <SheetClose asChild>
                <button
                  type="button"
                  className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                  aria-label="Close profile menu"
                >
                  <ArrowLeft className="size-5" />
                </button>
              </SheetClose>
              <Title>Your Profile</Title>
            </div>
            <ProfileBar
              replace
              onClick={() => setOpen(false)}
              className="mt-0 bg-white"
            />
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
            <p className="mb-2 mt-5 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Your account
            </p>
            <nav className="space-y-1" aria-label="Profile menu links">
              {DRAWER_MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    replace
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${
                      item.active
                        ? "text-primary"
                        : "text-slate-700 hover:bg-white hover:text-slate-950"
                    }`}
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        item.active
                          ? "bg-primary text-white"
                          : "bg-primary/5 text-primary group-hover:text-primary"
                      }`}
                    >
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>
                      <span className="block truncate text-[11px] text-slate-400">
                        {item.description}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-slate-300" />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto">
              <button
                type="button"
                onClick={handleLogout}
                className="center w-full rounded-xl px-3 py-3 text-sm font-medium text-red-500 transition hover:bg-red-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 bg-red-500/10"
              >
                Log out from tourtoise
              </button>
              <p className="text-xs text-center mt-4 text-slate-500">
                tourtoise &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavDrawer;
