import { Button } from "@/components/ui/button";

export const EmptyDestinationList = ({ clearFilters }) => {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <h2 className="text-lg font-semibold text-slate-950">
        No destinations found
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Adjust the search, country, or destination type filters.
      </p>
      <Button className="mt-4" variant="outline" onClick={clearFilters}>
        Clear filters
      </Button>
    </div>
  );
};

export const LoadingDestinationList = () => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
      <h2 className="text-lg font-semibold text-slate-950">
        Loading destinations
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Fetching published destinations from the API.
      </p>
    </div>
  );
};

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
