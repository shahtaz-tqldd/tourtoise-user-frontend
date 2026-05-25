import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  BellRing,
  Bookmark,
  ChevronDown,
  Clock3,
  LogOut,
  MapPin,
  MessageCircle,
  PawPrint,
  Search,
  Settings,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userLoggedOut } from "@/features/auth/authSlice";
import { cn, fallbackValue, getInitials } from "@/lib/utils";
// import {
//   buildFeedFilterSearch,
//   getFeedFiltersFromSearch,
// } from "@/pages/feeds/utils/feed-filter-state";

const alertItems = [
  {
    id: "nearby",
    title: "3 new strays nearby",
    description: "Within your selected discovery area",
    icon: MapPin,
    tone: "primary",
  },
  {
    id: "urgent",
    title: "Urgent rescue alert",
    description: "A rescuer marked a case as time-sensitive",
    icon: ShieldAlert,
    tone: "amber",
  },
  {
    id: "shortlist",
    title: "Shortlist activity",
    description: "One saved stray has a new update",
    icon: Bookmark,
    tone: "soft",
  },
];

const MainHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  // const filters = React.useMemo(
  //   () => getFeedFiltersFromSearch(location.search),
  //   [location.search],
  // );
  const fullName = fallbackValue(
    user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
    "Guest User",
  );
  const profileImage = user?.avatar || user?.profile_picture_url;
  const profilePath = `/profile/${user?.username || "my-profile"}`;

  const navigateToSearch = React.useCallback(
    (searchTerm) => {
      // const search = buildFeedFilterSearch({
      //   ...filters,
      //   searchTerm,
      // });

      navigate(
        // {
        //   pathname: "/feeds",
        //   search: search ? `?${search}` : "",
        // },
        {
          replace: location.pathname === "/feeds",
        },
      );
    },
    // [filters, location.pathname, navigate],
    [location.pathname, navigate],
  );

  const handleLogout = () => {
    dispatch(userLoggedOut());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 border-b border-b-primary/10 bg-white/10 backdrop-blur-xl px-5 py-3">
        <label className="relative hidden min-w-0 max-w-xl flex-1 md:block">
          <span className="sr-only">Search feed</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary/55" />
          <Input
            // value={filters.searchTerm}
            onChange={(event) => navigateToSearch(event.target.value)}
            placeholder="Search strays, rescuers, or locations"
            className="h-11 rounded-full border-primary/15 bg-[#fcfdfb] pl-11 pr-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </label>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <AlertMenu />
          <ProfileMenu
            fullName={fullName}
            profileImage={profileImage}
            profilePath={profilePath}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};

const AlertMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="relative inline-flex size-11 items-center justify-center rounded-full border border-primary/10 bg-[#f8faf8] text-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        aria-label="Open rescue alerts"
      >
        <Bell className="size-5" />
        <span className="absolute right-2.5 top-2.5 size-2.5 rounded-full border-2 border-white bg-[#ffcf36]" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="w-[min(calc(100vw-2rem),24rem)] rounded-[24px] border-primary/10 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
    >
      <DropdownMenuLabel className="flex items-center gap-3 rounded-2xl bg-[#f7faf8] p-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-white">
          <BellRing className="size-4" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-900">
            Rescue alerts
          </span>
          <span className="mt-0.5 block text-xs font-normal text-slate-500">
            Top updates from nearby cases
          </span>
        </span>
      </DropdownMenuLabel>
      <div className="py-1">
        {alertItems.map((item) => {
          const Icon = item.icon;

          return (
            <DropdownMenuItem
              key={item.id}
              className="items-start gap-3 rounded-2xl px-3 py-3 focus:bg-primary/5"
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full",
                  item.tone === "primary" && "bg-primary/8 text-primary",
                  item.tone === "amber" && "bg-[#fff4c7] text-[#8a5b00]",
                  item.tone === "soft" && "bg-[#eef8f2] text-primary",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">
                  {item.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {item.description}
                </span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="rounded-2xl px-3 py-2.5 text-sm font-semibold text-primary focus:bg-primary/5 focus:text-primary">
        <Clock3 className="size-4" />
        View all alerts
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ProfileMenu = ({ fullName, profileImage, profilePath, onLogout }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="flex max-w-[12rem] items-center gap-2 rounded-full border border-primary/10 bg-white p-1.5 pr-2.5 text-left transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        aria-label="Open profile menu"
      >
        {profileImage ? (
          <img
            src={profileImage}
            className="size-9 rounded-full object-cover"
            alt=""
          />
        ) : (
          <span className="flex size-9 items-center justify-center rounded-full bg-[#d7efe2] text-sm font-semibold text-primary">
            {getInitials(fullName)}
          </span>
        )}
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-semibold leading-tight text-slate-900">
            {fullName}
          </span>
          <span className="block truncate text-xs capitalize text-slate-500">
            Member
          </span>
        </span>
        <ChevronDown className="hidden size-4 shrink-0 text-slate-400 sm:block" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="w-64 rounded-2xl border-primary/10 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
    >
      <DropdownMenuLabel className="flex items-center gap-3 rounded-xl bg-[#f4fbf7] p-3">
        {profileImage ? (
          <img
            src={profileImage}
            className="size-11 rounded-full object-cover"
            alt=""
          />
        ) : (
          <span className="flex size-11 items-center justify-center rounded-full bg-[#d7efe2] text-sm font-semibold text-primary">
            {getInitials(fullName)}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {fullName}
          </span>
          <span className="block truncate text-xs capitalize text-slate-500">
            Member
          </span>
        </span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <ProfileMenuItem to={profilePath} icon={<UserRound />}>
        My profile
      </ProfileMenuItem>
      <ProfileMenuItem to="/feeds" icon={<PawPrint />}>
        Adopt Pets
      </ProfileMenuItem>
      <ProfileMenuItem to="/" icon={<MessageCircle />}>
        Messages
      </ProfileMenuItem>
      <ProfileMenuItem to="/" icon={<Bookmark />}>
        Saved pets
      </ProfileMenuItem>
      <ProfileMenuItem to="/settings" icon={<Settings />}>
        Settings
      </ProfileMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={onLogout}
        className="rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
      >
        <LogOut className="size-4" />
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ProfileMenuItem = ({ to, icon, children }) => (
  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-sm">
    <Link to={to} className="flex items-center gap-2">
      {React.cloneElement(icon, { className: "size-4" })}
      <span>{children}</span>
    </Link>
  </DropdownMenuItem>
);

export default MainHeader;
