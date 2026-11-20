import { RotateCcw } from "lucide-react";

import { DESTINATION_GRID_CLASS } from "../constants";

export const LoadingDestinationList = () => (
  <ul
    className={`${DESTINATION_GRID_CLASS} motion-safe:animate-pulse`}
    role="status"
    aria-label="Loading destinations"
    aria-live="polite"
  >
    {Array.from({ length: 8 }, (_, index) => (
      <li key={index} className="aspect-[4/5] rounded-2xl bg-ink-200/70" />
    ))}
    <span className="sr-only">Loading destinations...</span>
  </ul>
);

export const DestinationFetchError = ({ onRetry }) => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-10 text-center">
      <h2 className="text-lg font-semibold text-red-900">
        Could not load destinations
      </h2>
      <p className="mt-1 text-sm text-red-700">
        Something went wrong while fetching destinations. Check your
        connection and try again.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-red-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900/40"
        >
          <RotateCcw size={15} aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
};
