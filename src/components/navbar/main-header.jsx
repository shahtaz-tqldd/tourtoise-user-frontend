import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { Logo } from "../shared/utils";
import AlertMenu from "../shared/alerts";

const MainHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToSearch = React.useCallback(
    () => {
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

  return (
    <header className="w-full sticky top-0 z-40 border-b border-b-primary/10 bg-white/10 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-2.5 md:py-3">
        <Logo className="flex md:hidden" />
        <label className="relative hidden min-w-0 max-w-xl flex-1 md:block">
          <span className="sr-only">Search feed</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary/55" />
          <Input
            // value={filters.searchTerm}
            onChange={(event) => navigateToSearch(event.target.value)}
            placeholder="Search destinations, tour plans and posts"
            className="h-11 rounded-full border-primary/15 bg-[#fcfdfb] pl-11 pr-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </label>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigateToSearch("")}
            className="size-9 md:size-11 items-center justify-center rounded-full border border-primary/10 bg-[#f8faf8] text-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 flex md:hidden"
            aria-label="Search"
          >
            <Search className="size-4 md:size-5" />
          </button>
          <AlertMenu />
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
