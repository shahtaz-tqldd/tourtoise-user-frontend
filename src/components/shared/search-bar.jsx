import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

const SearchBar = ({ placeholder, searchQuery, setSearchQuery, className }) => {
  return (
    <div className={cn("relative min-w-0 flex-1 max-w-sm", className)}>
      <Search
        size={17}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <Input
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-full border-slate-200 bg-white pl-11 pr-11 text-sm shadow-none focus-visible:ring-primary/15"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
