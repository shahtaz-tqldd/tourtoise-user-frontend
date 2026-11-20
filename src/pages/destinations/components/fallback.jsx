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
