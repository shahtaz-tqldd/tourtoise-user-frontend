import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

const SearchField = ({
  value,
  onChange,
  onClear,
  placeholder,
  className = "",
}) => (
  <div className={cn("relative w-full min-w-0", className)}>
    <Search
      size={17}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
    />
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-12 w-full rounded-full border-slate-200 bg-slate-50 pl-11 pr-11 text-sm shadow-none focus-visible:ring-primary/15"
    />
    {value && (
      <button
        type="button"
        onClick={onClear}
        className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
        aria-label="Clear search"
      >
        <X size={15} />
      </button>
    )}
  </div>
);

export default SearchField;
