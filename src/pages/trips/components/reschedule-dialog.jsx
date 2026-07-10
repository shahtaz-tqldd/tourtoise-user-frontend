import React, { useState } from "react";
import PreviewContent from "@/components/shared/preview-content";
import { FloatingInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const addDays = (dateValue, days) => {
  if (!dateValue || !Number.isFinite(days)) return "";

  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
};

const RescheduleDialog = ({
  trip,
  open,
  onOpenChange,
  isLoading,
  onSubmit,
}) => {
  const [form, setForm] = useState(() => ({
    startDate: trip.start_date || "",
    duration: String(trip.duration_days || trip.days || ""),
  }));
  const endDate =
    form.startDate && Number(form.duration) > 0
      ? addDays(form.startDate, Number(form.duration) - 1)
      : "";

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      start_date: form.startDate,
      end_date: endDate,
      days: Number(form.duration),
    });
  };

  return (
    <PreviewContent
      open={open}
      onOpenChange={onOpenChange}
      className="md:p-8 p-6 !max-w-xl h-fit"
    >
      <h2 className="text-lg font-bold mt-2 md:mt-0">Reschedule trip</h2>
      <p className="text-sm mt-1 text-slate-500">
        Update the trip start date and total duration.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 mt-8">
        <div className="grid gap-3 sm:grid-cols-2">
          <FloatingInput
            name="reschedule-start-date"
            type="date"
            label="Start date"
            value={form.startDate}
            onChange={(event) => updateField("startDate", event.target.value)}
            required
          />
          <FloatingInput
            name="reschedule-duration"
            type="number"
            label="Duration"
            min="1"
            placeholder="Days"
            value={form.duration}
            onChange={(event) => updateField("duration", event.target.value)}
            required
          />
        </div>
        {endDate && (
          <p className="-mt-2 text-xs text-slate-500">
            End date will be {endDate}.
          </p>
        )}
        <div className="mt-8 flex md:flex-row flex-col w-full md:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="w-full md:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </PreviewContent>
  );
};

export default RescheduleDialog;
