import React from "react";
import clsx from "clsx";

const StatusBadge = ({ status }) => {
  const normalized = status.toLowerCase();

  const styles = {
    active: "bg-green-100 text-emerald-700",
    inactive: "bg-gray-100 text-gray-700",
    blocked: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-emerald-100 text-emerald-700",
    "pending payment": "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-emerald-100 text-emerald-700",
    processing: "bg-purple-100 text-purple-700",
    draft: "bg-slate-100 text-slate-700",
    published: "bg-emerald-100 text-emerald-700",
    archived: "bg-gray-100 text-gray-700",
  };

  const appliedStyle = styles[normalized] ?? "bg-gray-100 text-gray-700";

  return (
    <span
      className={clsx(
        "px-3 py-1 text-xs font-semibold rounded-md capitalize",
        appliedStyle
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
