import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
];

const TripStatusFilter = ({ value, onApply }) => {
  const [open, setOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState(value);

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) setDraftStatus(value);
    setOpen(nextOpen);
  };

  const applyFilter = () => {
    onApply(draftStatus);
    setOpen(false);
  };

  const cancelFilter = () => {
    setDraftStatus(value);
    setOpen(false);
  };

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-12 rounded-full border-slate-200"
            aria-label="Open trip filters"
          >
            <SlidersHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[min(calc(100vw-2rem),320px)] rounded-2xl border-slate-200 bg-white p-0 shadow-xl"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div className="border-b border-slate-100 p-4">
            <h2 className="text-base font-bold text-slate-950">
              Filter trip plans
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose which trip status to show.
            </p>
          </div>

          <div className="space-y-2 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Status
            </p>
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm font-semibold transition ${
                  draftStatus === option.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <input
                  type="radio"
                  name="trip-status-filter"
                  value={option.value}
                  checked={draftStatus === option.value}
                  onChange={(event) => setDraftStatus(event.target.value)}
                  className="size-4 accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
            <Button type="button" variant="outline" onClick={cancelFilter}>
              Cancel
            </Button>
            <Button type="button" onClick={applyFilter}>
              Apply
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {value !== "all" && (
        <span className="absolute -right-1 -top-1 size-3 rounded-full bg-primary" />
      )}
    </div>
  );
};

export default TripStatusFilter;
