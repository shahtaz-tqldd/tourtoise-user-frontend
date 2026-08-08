import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import PreviewDropdown from "@/components/shared/preview-dropdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "ready", label: "Ready" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "archived", label: "Archived" },
];
const activeStatusValues = ["draft", "ready", "in_progress"];

const TripStatusFilter = ({ value, onApply }) => {
  const [open, setOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState(value);
  const appliedFilterCount = value.filter((status) => status !== "active").length;
  const hasDraftFilters =
    draftStatus.length !== 1 || draftStatus[0] !== "active";

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) setDraftStatus([...value]);
    setOpen(nextOpen);
  };

  const toggleStatus = (status) => {
    setDraftStatus((currentStatuses) => {
      if (!currentStatuses.includes(status)) {
        if (status === "active") {
          return [
            ...currentStatuses.filter(
              (currentStatus) => !activeStatusValues.includes(currentStatus),
            ),
            status,
          ];
        }

        if (activeStatusValues.includes(status)) {
          return [
            ...currentStatuses.filter(
              (currentStatus) => currentStatus !== "active",
            ),
            status,
          ];
        }

        return [...currentStatuses, status];
      }

      // A status filter is always required; Active is the default selection.
      if (currentStatuses.length === 1) return currentStatuses;

      return currentStatuses.filter(
        (currentStatus) => currentStatus !== status,
      );
    });
  };

  const applyFilter = () => {
    onApply(draftStatus);
    setOpen(false);
  };

  const cancelFilter = () => {
    setDraftStatus([...value]);
    setOpen(false);
  };

  const clearFilter = () => {
    const defaultStatus = ["active"];
    setDraftStatus(defaultStatus);
    onApply(defaultStatus);
    setOpen(false);
  };

  return (
    <div className="relative">
      <PreviewDropdown
        open={open}
        onOpenChange={handleOpenChange}
        title="Filter trip plans"
        description="Choose which trip status to show."
        desktopClassName="w-[min(calc(100vw-2rem),320px)]"
        trigger={
          <Button
            type="button"
            variant="outline"
            className="h-12 w-12 rounded-full border-slate-200"
            aria-label="Open trip filters"
          >
            <SlidersHorizontal size={16} />
          </Button>
        }
      >
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-base font-bold text-slate-950">
            Filter trip plans
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose which trip status to show.
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex w-fit cursor-pointer gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                  draftStatus.includes(option.value)
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-primary/10",
                )}
              >
                <input
                  type="checkbox"
                  name="trip-status-filter"
                  value={option.value}
                  checked={draftStatus.includes(option.value)}
                  onChange={() => toggleStatus(option.value)}
                  className="hidden size-4 accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            variant="outline"
            onClick={hasDraftFilters ? clearFilter : cancelFilter}
          >
            {hasDraftFilters ? "Clear Filter" : "Cancel"}
          </Button>
          <Button type="button" onClick={applyFilter}>
            Apply
          </Button>
        </div>
      </PreviewDropdown>

      {appliedFilterCount > 0 && (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
          {appliedFilterCount}
        </span>
      )}
    </div>
  );
};

export default TripStatusFilter;
