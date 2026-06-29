import { cn } from "@/lib/utils";
import React from "react";

const SnapshotCard = ({ icon: Icon, label, value, className = "" }) => {
  return (
    <div className={cn("min-w-0 flex flex-col items-center", className)}>
      <div className="bg-primary/10 h-10 w-10 center rounded-full">
        {React.createElement(Icon, {
          size: 16,
          className: "shrink-0 text-primary",
        })}
      </div>
      <h4 className="truncate text-sm text-slate-500 mt-3">{label}</h4>
      <p className="mt-1 break-words text-xs font-semibold text-slate-950 text-center">
        {value}
      </p>
    </div>
  );
};

export default SnapshotCard;
