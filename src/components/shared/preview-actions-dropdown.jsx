import React, { useEffect, useRef, useState } from "react";

import PreviewDropdown from "@/components/shared/preview-dropdown";
import { useMediaQuery } from "@/lib/mobile-visible";
import { cn } from "@/lib/utils";

const PreviewActionsDropdown = ({
  trigger,
  actions,
  title = "Actions",
  description = "Choose an action.",
  align = "end",
  contentClassName,
}) => {
  const isMobile = useMediaQuery();
  const [open, setOpen] = useState(false);
  const actionTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (actionTimerRef.current) {
        window.clearTimeout(actionTimerRef.current);
      }
    },
    [],
  );

  const selectAction = (action) => {
    if (action.disabled) return;

    setOpen(false);

    if (!isMobile) {
      action.onSelect?.();
      return;
    }

    if (actionTimerRef.current) {
      window.clearTimeout(actionTimerRef.current);
    }

    // Wait for the current sheet to release focus and its history entry before
    // a selected action opens another drawer or dialog.
    actionTimerRef.current = window.setTimeout(() => {
      action.onSelect?.();
      actionTimerRef.current = null;
    }, 300);
  };

  return (
    <PreviewDropdown
      open={open}
      onOpenChange={setOpen}
      title={title}
      description={description}
      align={align}
      desktopClassName={cn("w-40", contentClassName)}
      trigger={trigger}
    >
      <div className="border-b border-slate-100 px-4 pb-4 pt-2 md:hidden">
        <h2 className="font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="space-y-1 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {actions.map((action) => (
          <button
            key={action.value || action.label}
            type="button"
            disabled={action.disabled}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50",
              action.destructive
                ? "text-destructive hover:bg-destructive/10"
                : "text-slate-700",
              action.className,
            )}
            onClick={() => selectAction(action)}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </PreviewDropdown>
  );
};

export default PreviewActionsDropdown;
