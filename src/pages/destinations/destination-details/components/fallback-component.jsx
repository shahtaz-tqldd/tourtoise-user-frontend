import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

export const EmptyDestination = () => {
  return (
    <section className="space-y-4 py-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-primary"
      >
        <ArrowLeft size={16} />
        Destinations
      </Link>
      <div className="rounded-xl border border-line bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-heading">
          Destination not found
        </h1>
        <p className="mt-1 text-sm text-subtle">
          The selected destination could not be loaded.
        </p>
      </div>
    </section>
  );
};

export const DestinationLoader = () => {
  return (
    <div className="center min-h-[420px] text-primary">
      <Loader2 className="mr-2 animate-spin" size={22} />
      Loading destination...
    </div>
  );
};
