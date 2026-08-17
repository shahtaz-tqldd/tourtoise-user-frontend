import React from "react";
import clsx from "clsx";

const StatusBadge = ({ status }) => {
  const normalized = status.toLowerCase();

  const styles = {
    ready: "bg-primary text-white",
    completed: "bg-primary text-white",
    draft: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-700",
    active: "bg-green-100 text-emerald-700",
    inactive: "bg-gray-100 text-gray-700",
    blocked: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-emerald-100 text-emerald-700",
    in_progress: "bg-primary/10 text-primary",
    processing: "bg-purple-100 text-purple-700",
    published: "bg-emerald-100 text-emerald-700",
    archived: "bg-gray-100 text-gray-700",
  };

  const appliedStyle = styles[normalized] ?? "bg-gray-100 text-gray-700";
  const displayStatus = normalized.replace(/_/g, " ");
  const isRipple = ["in_progress", "processing"].includes(normalized);

  return (
    <span
      className={clsx(
        "px-2.5 py-1 text-xs flx gap-2 font-semibold rounded-md capitalize overflow-hidden whitespace-nowrap overflow-ellipsis",
        appliedStyle,
      )}
    >
      {isRipple ? (
        <span className="bg-primary/60 rounded-full h-1.5 w-1.5 relative inline-flex items-center">
          <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-current"></span>
        </span>
      ) : null}
      {displayStatus}
    </span>
  );
};

export default StatusBadge;
