const DestinationCardSkeleton = ({ index }) => {
  const titleWidths = ["w-2/3", "w-1/2", "w-3/4"];
  const locationWidths = ["w-2/5", "w-1/3", "w-1/2"];

  return (
    <div
      className="relative aspect-square overflow-hidden rounded-[28px] bg-slate-200"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-slate-300 via-slate-200 to-slate-100" />

      <div className="absolute left-4 right-4 top-4 flex gap-2">
        <div className="h-7 w-24 rounded-full bg-white/75" />
        {index % 2 === 0 && (
          <div className="h-7 w-20 rounded-full bg-emerald-100/80" />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 space-y-3 p-4 sm:p-5">
        <div
          className={`h-7 rounded-full bg-white/85 ${titleWidths[index % titleWidths.length]}`}
        />
        <div className="flex items-center gap-2">
          <div className="size-4 shrink-0 rounded-full bg-white/65" />
          <div
            className={`h-3 rounded-full bg-white/65 ${locationWidths[index % locationWidths.length]}`}
          />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-white/35" />
          <div className="h-6 w-20 rounded-full bg-white/35" />
          <div className="hidden h-6 w-14 rounded-full bg-white/35 min-[360px]:block" />
        </div>
      </div>
    </div>
  );
};

export const LoadingDestinationList = () => (
  <div
    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    role="status"
    aria-label="Loading destinations"
    aria-live="polite"
  >
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="motion-safe:animate-pulse">
        <DestinationCardSkeleton index={index} />
      </div>
    ))}
    <span className="sr-only">Loading destinations...</span>
  </div>
);

export const DestinationFetchError = () => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-10 text-center">
      <h2 className="text-lg font-semibold text-red-900">
        Could not load destinations
      </h2>
      <p className="mt-1 text-sm text-red-700">
        Check the API base URL, endpoint path, and whether published
        destinations exist.
      </p>
    </div>
  );
};
