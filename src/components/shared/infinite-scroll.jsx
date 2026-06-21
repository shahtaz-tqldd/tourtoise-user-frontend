import React, { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const InfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  className,
  loadingLabel = "Loading more...",
}) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (!hasMore && !isLoading) return null;

  return (
    <div
      ref={sentinelRef}
      className={cn(
        "flex min-h-10 items-center justify-center py-3 text-xs font-medium text-slate-500",
        className,
      )}
      aria-live="polite"
    >
      {isLoading && (
        <>
          <span className="mr-2 size-4 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
          {loadingLabel}
        </>
      )}
    </div>
  );
};

export default InfiniteScroll;
