import React from "react";

const TripListLoader = ({ compact = false }) => (
  <div className="grid gap-3">
    {Array.from({ length: compact ? 4 : 3 }).map((_, index) => (
      <div
        key={index}
        className={`animate-pulse rounded-lg border border-slate-200 bg-slate-100 ${
          compact ? "h-32" : "h-44"
        }`}
      />
    ))}
  </div>
);

export default TripListLoader;
