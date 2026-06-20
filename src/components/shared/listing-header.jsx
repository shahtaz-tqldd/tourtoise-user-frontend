import { cn } from "@/lib/utils";

const ListingHeader = ({
  title,
  description,
  filters = null,
  className = "",
}) => (
  <div
    className={cn(
      "flex w-full flex-col gap-4 md:flex-row md:items-start",
      className,
    )}
  >
    <div className="shrink-0">
      <h1 className="text-xl font-bold text-slate-800 md:text-2xl">{title}</h1>
      {description && (
        <p className="mt-1.5 max-w-xl text-sm font-medium text-slate-500">
          {description}
        </p>
      )}
    </div>

    {filters && <div className="min-w-0 flex-1">{filters}</div>}
  </div>
);

export default ListingHeader;
