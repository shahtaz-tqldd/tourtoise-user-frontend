import React, { useId } from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

const EmptyItems = ({
  title = "Nothing here yet",
  description,
  icon = Inbox,
  className = "",
}) => {
  const titleId = useId();

  return (
    <section
      className={cn(
        "center min-h-40 w-full flex-col rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-center",
        className,
      )}
      aria-labelledby={titleId}
    >
      <span
        className="center size-11 rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200"
        aria-hidden="true"
      >
        {React.createElement(icon, { className: "size-5" })}
      </span>
      <h3 id={titleId} className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </h3>
      {description ? (
        <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
          {description}
        </p>
      ) : null}
    </section>
  );
};

export default EmptyItems;
