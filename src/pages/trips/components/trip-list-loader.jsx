import React from "react";

const SkeletonBlock = ({ className = "" }) => (
  <div className={`rounded-full bg-slate-100 ${className}`} />
);

const FeedCardSkeleton = ({ index }) => {
  const titleWidths = ["w-3/5", "w-3/4", "w-1/2"];

  return (
    <article
      className="flex flex-col overflow-hidden rounded-3xl bg-white md:flex-row"
      aria-hidden="true"
    >
      <div className="h-56 w-full shrink-0 bg-slate-200 md:h-auto md:w-92 md:self-stretch" />

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-6 p-4 md:p-5">
        <div className="space-y-4">
          <div className="flex gap-2">
            <SkeletonBlock className="h-6 w-16 bg-primary/10" />
            <SkeletonBlock className="h-6 w-20" />
          </div>

          <div className="space-y-2">
            <SkeletonBlock
              className={`h-5 ${titleWidths[index % titleWidths.length]}`}
            />
            <div className="flex items-center gap-2">
              <SkeletonBlock className="size-4 shrink-0" />
              <SkeletonBlock className="h-3 w-2/5" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SkeletonBlock className="size-4 shrink-0" />
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="size-1.5" />
            <SkeletonBlock className="h-3 w-16" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <SkeletonBlock className="h-8 w-28 rounded-lg" />
          <SkeletonBlock className="h-8 w-36 rounded-lg" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-4">
            <SkeletonBlock className="h-3 w-14" />
            {index % 2 === 0 ? (
              <SkeletonBlock className="h-3 w-16" />
            ) : null}
          </div>
          <SkeletonBlock className="h-8 w-24 bg-primary/10" />
        </div>
      </div>
    </article>
  );
};

const HistoryCardSkeleton = ({ index }) => {
  const titleWidths = ["w-4/5", "w-2/3", "w-3/4"];

  return (
    <article
      className="rounded-3xl border border-slate-100 bg-white p-4 md:border-none md:p-6"
      aria-hidden="true"
    >
      <div className="flex gap-2">
        <SkeletonBlock className="h-6 w-16 bg-primary/10" />
        <SkeletonBlock className="h-6 w-20" />
      </div>

      <div className="mt-3 space-y-2">
        <SkeletonBlock
          className={`h-4 ${titleWidths[index % titleWidths.length]}`}
        />
        <div className="flex items-center gap-2">
          <SkeletonBlock className="size-3.5 shrink-0" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <SkeletonBlock className="h-8 w-28 rounded-lg" />
        <SkeletonBlock className="h-8 w-24 rounded-lg" />
      </div>
    </article>
  );
};

const TripListLoader = ({ compact = false }) => (
  <div
    className="flex flex-col gap-5"
    role="status"
    aria-label={compact ? "Loading trip history" : "Loading active trips"}
    aria-live="polite"
  >
    {Array.from({ length: compact ? 4 : 3 }, (_, index) => (
      <div key={index} className="motion-safe:animate-pulse">
        {compact ? (
          <HistoryCardSkeleton index={index} />
        ) : (
          <FeedCardSkeleton index={index} />
        )}
      </div>
    ))}
    <span className="sr-only">
      {compact ? "Loading trip history..." : "Loading active trips..."}
    </span>
  </div>
);

export default TripListLoader;
